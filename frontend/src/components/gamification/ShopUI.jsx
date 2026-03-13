import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Coins, Lock, Check, Star, AlertTriangle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { API } from '@/lib/config';
import { ENHANCED_SHOP_ITEMS } from '@/data/sampleGamificationData';

const rarityColors = {
  common: 'from-slate-400 to-slate-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
};

// userCoins prop: actual coins from parent (GamificationPage). onCoinsUpdate: callback to sync parent after purchase.
const ShopUI = ({ user, shopItems: propShopItems, userCoins: propUserCoins = 0, userLevel: propUserLevel = 1, onCoinsUpdate }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoins, setUserCoins] = useState(propUserCoins);
  const [userLevel, setUserLevel] = useState(propUserLevel);
  const [purchasing, setPurchasing] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null); // item pending confirmation

  // Sync coins from parent whenever it updates (e.g. after page-level refetch)
  useEffect(() => {
    setUserCoins(propUserCoins);
    // Also refresh canAfford flags on all items when parent coins change
    setItems(prev => prev.map(item => ({ ...item, canAfford: propUserCoins >= item.price })));
  }, [propUserCoins]);

  useEffect(() => {
    setUserLevel(propUserLevel);
    setItems(prev => prev.map(item => ({ ...item, canBuy: propUserLevel >= (item.levelRequired || 1) })));
  }, [propUserLevel]);

  useEffect(() => {
    fetchShopItems();
  }, []);

  const fetchShopItems = async () => {
    try {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${API}/gamification/shop`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.items && response.data.items.length > 0) {
          // Always trust the API coin value; if 0 and prop says more, use prop (first-visit race condition)
          const apiCoins = response.data.userCoins ?? propUserCoins;
          const apiLevel = response.data.userLevel ?? propUserLevel;
          setItems(response.data.items.map(item => ({
            ...item,
            canAfford: apiCoins >= item.price,
            canBuy: apiLevel >= (item.levelRequired || 1)
          })));
          setUserCoins(apiCoins);
          setUserLevel(apiLevel);
        } else {
          // No items from API — use ENHANCED_SHOP_ITEMS with real coins from prop
          const coins = propUserCoins;
          const level = propUserLevel;
          setItems(ENHANCED_SHOP_ITEMS.map(item => ({ 
            ...item, 
            owned: false, 
            _id: item._id || Math.random().toString(),
            canAfford: coins >= item.price,
            canBuy: level >= (item.levelRequired || 1)
          })));
        }
      } catch (apiError) {
        // API error — use sample items but real coins from parent prop
        console.log('Using sample shop data');
        const coins = propUserCoins;
        const level = propUserLevel;
        setItems(ENHANCED_SHOP_ITEMS.map(item => ({ 
          ...item, 
          owned: false, 
          _id: item._id || Math.random().toString(),
          canAfford: coins >= item.price,
          canBuy: level >= (item.levelRequired || 1)
        })));
      }
    } catch (error) {
      console.error('Failed to fetch shop items:', error);
      toast.error('Failed to load shop');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: show confirmation dialog instead of buying immediately
  const handlePurchase = (itemId) => {
    const itemToPurchase = items.find(item => item._id === itemId);
    if (!itemToPurchase) { toast.error('Item not found'); return; }

    // Hard-block: level requirement
    if (!itemToPurchase.canBuy) {
      toast.error(`🔒 Level ${itemToPurchase.levelRequired} required to buy this item`);
      return;
    }

    // Hard-block: not enough coins (always compare against live userCoins state)
    if (userCoins < itemToPurchase.price) {
      toast.error(`❌ Not enough coins — you need ${itemToPurchase.price} coins but only have ${userCoins}`);
      return;
    }

    // All checks passed — show confirmation dialog
    setConfirmItem(itemToPurchase);
  };

  // Step 2: user confirmed — do the actual purchase
  const handleConfirmPurchase = async () => {
    const itemToPurchase = confirmItem;
    setConfirmItem(null);
    if (!itemToPurchase) return;

    // Re-validate with live state before sending request
    if (userCoins < itemToPurchase.price) {
      toast.error('Not enough coins');
      return;
    }

    try {
      setPurchasing(itemToPurchase._id);
      const token = localStorage.getItem('token');

      const applyPurchase = (newCoins) => {
        setUserCoins(newCoins);
        setItems(prevItems =>
          prevItems.map(item => ({
            ...item,
            owned: item._id === itemToPurchase._id ? true : item.owned,
            canAfford: newCoins >= item.price,
          }))
        );
        // Notify parent (GamificationPage) so header + shop banner stay in sync
        if (onCoinsUpdate) onCoinsUpdate(newCoins);
        toast.success(`🎉 "${itemToPurchase.name}" purchased! ${newCoins} coins remaining`);
      };

      try {
        const response = await axios.post(
          `${API}/gamification/shop/purchase/${itemToPurchase._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const remaining = response.data.remainingCoins ?? (userCoins - itemToPurchase.price);
        applyPurchase(remaining);
      } catch (apiError) {
        // Offline / DB fallback — still deduct coins locally
        console.log('API purchase failed, applying locally');
        applyPurchase(userCoins - itemToPurchase.price);
      }
    } catch (error) {
      toast.error(error.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const groupedItems = {
    all: items,
    themes: items.filter(i => i.type === 'theme'),
    skins: items.filter(i => i.type === 'skin'),
    accessories: items.filter(i => i.type === 'accessory'),
    effects: items.filter(i => i.type === 'effect')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setConfirmItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-bold text-slate-800 text-lg">Confirm Purchase</span>
                </div>
                <button onClick={() => setConfirmItem(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-4 mb-5">
                <div className="text-5xl">{confirmItem.icon}</div>
                <div>
                  <p className="font-bold text-slate-800">{confirmItem.name}</p>
                  <p className="text-sm text-slate-500">{confirmItem.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-5">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span>Cost: <span className="font-bold text-slate-800">{confirmItem.price} coins</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span>After purchase: <span className="font-bold text-emerald-600">{userCoins - confirmItem.price} coins</span></span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50"
                  onClick={() => setConfirmItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm"
                  onClick={handleConfirmPurchase}
                >
                  <ShoppingBag className="w-4 h-4 mr-1.5" />
                  Buy Now
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with coins */}
      <div className="flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-500" />
          <span className="text-slate-700 font-medium text-sm">Your Balance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="text-2xl font-bold text-slate-800">{userCoins}</span>
          <span className="text-sm text-slate-500 ml-1">coins</span>
        </div>
      </div>

      {/* Shop items */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="skins">Skins</TabsTrigger>
          <TabsTrigger value="accessories">Accessories</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
        </TabsList>

        {Object.entries(groupedItems).map(([key, itemList]) => (
          <TabsContent key={key} value={key} className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {itemList.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`overflow-hidden border-2 ${
                      item.owned ? 'border-green-400' : 'border-slate-200'
                    }`}>
                      <CardHeader className={`bg-gradient-to-br ${rarityColors[item.rarity]} p-6`}>
                        <div className="flex justify-between items-start">
                          <Badge className="bg-white/30 text-white border-0">
                            {item.rarity}
                          </Badge>
                          {item.owned && (
                            <Badge className="bg-green-500 text-white border-0">
                              <Check className="w-3 h-3 mr-1" />
                              Owned
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-center py-8">
                          <motion.div
                            animate={{ 
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-6xl mb-4"
                          >
                            {item.icon}
                          </motion.div>
                          
                          <CardTitle className="text-white text-xl">
                            {item.name}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6">
                        <p className="text-sm text-slate-600 mb-4 min-h-[40px]">
                          {item.description}
                        </p>

                        {/* Requirements */}
                        <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                          <Star className="w-4 h-4" />
                          <span>Level {item.levelRequired} required</span>
                        </div>

                        {/* Price and Purchase */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Coins className="w-5 h-5 text-yellow-500" />
                            <span className="text-2xl font-bold text-slate-800">
                              {item.price}
                            </span>
                          </div>

                          <Button
                            onClick={() => handlePurchase(item._id)}
                            disabled={
                              item.owned ||
                              !item.canAfford ||
                              !item.canBuy ||
                              purchasing === item._id
                            }
                            className={`rounded-full px-4 py-1.5 text-sm font-semibold text-white border-0 shadow-sm transition-all duration-200 ${
                              item.owned
                                ? 'bg-emerald-500 cursor-default'
                                : !item.canBuy
                                ? 'bg-slate-400 cursor-not-allowed opacity-80'
                                : !item.canAfford
                                ? 'bg-rose-500 cursor-not-allowed opacity-90'
                                : 'bg-teal-600 hover:bg-teal-700 active:scale-95 hover:shadow-md'
                            }`}
                          >
                            {purchasing === item._id ? (
                              <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Buying...
                              </span>
                            ) : item.owned ? (
                              <span className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" />
                                Owned
                              </span>
                            ) : !item.canBuy ? (
                              <span className="flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5" />
                                Locked
                              </span>
                            ) : !item.canAfford ? (
                              <span className="flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5" />
                                Need More Coins
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Purchase
                              </span>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ShopUI;
