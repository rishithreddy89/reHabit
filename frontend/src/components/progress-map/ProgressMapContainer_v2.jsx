import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { API } from '@/lib/config';
import { useNavigate, useLocation } from 'react-router-dom';

// Build 100 levels distributed along path
const buildLevels = () => {
	const levels = [];
	for (let i = 1; i <= 100; i++) {
		// Distribute levels evenly from 0.01 to 0.99
		const percent = 0.01 + ((i - 1) / 99) * 0.98;
		levels.push({ id: i, percent, label: `Level ${i}` });
	}
	return levels;
};

const ProgressMapContainer = ({ onClose, onNavigate, user, currentUserId }) => {
	const levels = buildLevels();
	const location = useLocation();
	const resolvedInitial = (() => {
		if (!user) return 1;
		return user.level || user.currentLevel || user.progressLevel || 1;
	})();
	const [userLevel, setUserLevel] = useState(resolvedInitial);
	const pathRef = useRef(null);
	const completedPathRef = useRef(null);
	const canvasRef = useRef(null);
	const [positions, setPositions] = useState({});
	const [leaderboardUsers, setLeaderboardUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const navigate = useNavigate();

	// Fetch leaderboard users
	useEffect(() => {
		const fetchLeaderboard = async () => {
			try {
				const token = localStorage.getItem('token');
				const response = await axios.get(`${API}/gamification/leaderboard?type=level`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				if (response.data) {
					// Map users to include their level and display info
					const users = response.data.slice(0, 20).map(entry => ({
						id: entry.userId?._id || entry.userId,
						name: entry.userId?.name || entry.userId?.username || 'User',
						level: entry.level || 1,
						avatarEmoji: entry.userId?.avatarEmoji || entry.avatar?.emoji || '🧑',
						isCurrentUser: (entry.userId?._id || entry.userId) === currentUserId
					}));
					setLeaderboardUsers(users);
				}
			} catch (error) {
				console.error('Failed to fetch leaderboard:', error);
			}
		};
		fetchLeaderboard();
	}, [currentUserId]);

	const getPosition = useCallback((percent) => {
		if (!pathRef.current) return { x: 0, y: 0 };
		const path = pathRef.current;
		const length = path.getTotalLength();
		const point = path.getPointAtLength(length * percent);
		const svg = path.ownerSVGElement;
		const pt = svg.createSVGPoint();
		pt.x = point.x; pt.y = point.y;
		const screenPt = pt.matrixTransform(svg.getScreenCTM());
		if (!canvasRef.current) return { x: point.x, y: point.y };
		const rect = canvasRef.current.getBoundingClientRect();
		return { x: screenPt.x - rect.left + canvasRef.current.scrollLeft, y: screenPt.y - rect.top + canvasRef.current.scrollTop };
	}, []);

	const computePositions = useCallback(() => {
		if (!pathRef.current) return;
		const next = {};
		levels.forEach(l => { next[l.id] = getPosition(l.percent); });
		setPositions(next);
	}, [levels, getPosition]);

	useEffect(() => { computePositions(); }, [computePositions]);
	useEffect(() => {
		const onResize = () => computePositions();
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, [computePositions]);

	useEffect(() => {
		if (!pathRef.current || !completedPathRef.current) return;
		const clamped = Math.min(Math.max(1, userLevel), levels.length);
		const lvl = levels.find(l => l.id === clamped);
		if (!lvl) return;
		const total = pathRef.current.getTotalLength();
		const done = total * lvl.percent;
		completedPathRef.current.style.strokeDasharray = `${done} ${total}`;
	}, [userLevel, levels]);

	const centerOnUser = useCallback(() => {
		if (!canvasRef.current) return;
		const clamped = Math.min(Math.max(1, userLevel), levels.length);
		const pos = positions[clamped];
		if (!pos) return;
		const rect = canvasRef.current.getBoundingClientRect();
		const target = pos.y - rect.height / 2;
		canvasRef.current.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
	}, [userLevel, positions, levels]);
	useEffect(() => { centerOnUser(); }, [centerOnUser]);

	const levelUp = () => {
		if (user) return; // external user controls level
		const max = levels.length;
		setUserLevel(l => l < max ? l + 1 : l);
	};
	const handleClose = () => { if (!user) setUserLevel(1); onClose && onClose(); };

	// Styles
	const containerStyle = { position: 'relative', width: '100%', height: '100%', fontFamily: 'Inter, system-ui, sans-serif', background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)', display: 'flex', alignItems: 'stretch', justifyContent: 'stretch', overflow: 'hidden' };
	const phoneStyle = { width: '100%', height: '100%', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', position: 'relative', overflow: 'hidden' };
	const headerStyle = { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, padding: '12px 16px', background: 'rgba(15, 23, 42, 0.9)', borderBottom: '2px solid rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)' };
	const btnBase = { padding: '8px 14px', borderRadius: 999, fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: 14 };
	const btnLevelUp = { ...btnBase, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' };
	const btnClose = { ...btnBase, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' };
	const canvasStyle = { position: 'relative', width: '100%', height: 'calc(100% - 60px)', padding: 20, overflow: 'auto' };
	const infoStyle = { position: 'absolute', left: 16, bottom: 16, background: 'rgba(15, 23, 42, 0.9)', padding: '8px 12px', borderRadius: 8, fontSize: 12, color: '#e2e8f0', fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(59, 130, 246, 0.3)' };

	return (
		<div style={containerStyle}>
			<div style={phoneStyle}>
				<div style={headerStyle}>
					{!user && <button style={btnLevelUp} onClick={levelUp}>Level Up</button>}
						<button style={btnClose} onClick={handleClose}>Close</button>
					<div style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
						{leaderboardUsers.length > 0 ? `Top ${leaderboardUsers.length} Users` : `Level ${Math.min(userLevel, levels.length)} / ${levels.length}`}
					</div>
				</div>
				<div style={canvasStyle} ref={canvasRef}>
										{/* Animated Stars Background */}
										{[...Array(50)].map((_, i) => (
											<div
												key={i}
												style={{
													position: 'absolute',
													width: Math.random() * 3 + 1 + 'px',
													height: Math.random() * 3 + 1 + 'px',
													background: '#fff',
													borderRadius: '50%',
													top: Math.random() * 100 + '%',
													left: Math.random() * 100 + '%',
													opacity: Math.random() * 0.8 + 0.2,
													animation: `twinkle ${Math.random() * 3 + 2}s infinite ${Math.random() * 2}s`,
													boxShadow: '0 0 4px rgba(255,255,255,0.8)'
												}}
											/>
										))}
										<style>{`
											@keyframes twinkle {
												0%, 100% { opacity: 0.2; }
												50% { opacity: 1; }
											}
										`}</style>

					<svg viewBox="0 0 1200 16000" preserveAspectRatio="xMidYMin meet" style={{ width: '100%', height: 'auto', minHeight: '12000px', position: 'relative' }}>
						<defs>
							<linearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="1">
								<stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
								<stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
								<stop offset="100%" stopColor="#a78bfa" stopOpacity="1" />
							</linearGradient>
							<linearGradient id="completedGradient" x1="0" y1="0" x2="1" y2="1">
								<stop offset="0%" stopColor="#10b981" stopOpacity="1" />
								<stop offset="50%" stopColor="#14b8a6" stopOpacity="1" />
								<stop offset="100%" stopColor="#34d399" stopOpacity="1" />
														<filter id="glow">
															<feGaussianBlur stdDeviation="4" result="coloredBlur"/>
															<feMerge>
																<feMergeNode in="coloredBlur"/>
																<feMergeNode in="SourceGraphic"/>
															</feMerge>
														</filter>
														<radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
															<stop offset="0%" stopColor="#fef3c7" stopOpacity="1" />
															<stop offset="70%" stopColor="#fbbf24" stopOpacity="0.6" />
															<stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
														</radialGradient>
							</linearGradient>
						</defs>

						{/* Decorative Clouds */}
						<ellipse cx="200" cy="500" rx="80" ry="40" fill="rgba(148, 163, 184, 0.2)" filter="url(#glow)" />
						<ellipse cx="1000" cy="1500" rx="100" ry="50" fill="rgba(148, 163, 184, 0.15)" filter="url(#glow)" />
						<ellipse cx="300" cy="3000" rx="90" ry="45" fill="rgba(148, 163, 184, 0.2)" filter="url(#glow)" />
						<ellipse cx="950" cy="4500" rx="110" ry="55" fill="rgba(148, 163, 184, 0.15)" filter="url(#glow)" />
						<ellipse cx="250" cy="6000" rx="85" ry="42" fill="rgba(148, 163, 184, 0.2)" filter="url(#glow)" />
						<ellipse cx="1050" cy="7500" rx="95" ry="48" fill="rgba(148, 163, 184, 0.15)" filter="url(#glow)" />
						<ellipse cx="350" cy="9000" rx="100" ry="50" fill="rgba(148, 163, 184, 0.2)" filter="url(#glow)" />
						<ellipse cx="900" cy="10500" rx="90" ry="45" fill="rgba(148, 163, 184, 0.15)" filter="url(#glow)" />
						<ellipse cx="280" cy="12000" rx="105" ry="52" fill="rgba(148, 163, 184, 0.2)" filter="url(#glow)" />
						<ellipse cx="1000" cy="13500" rx="88" ry="44" fill="rgba(148, 163, 184, 0.15)" filter="url(#glow)" />

						{/* Decorative Moons/Suns at milestones */}
						<circle cx="150" cy="300" r="60" fill="url(#moonGlow)" opacity="0.6" />
						<circle cx="150" cy="300" r="40" fill="#fbbf24" filter="url(#glow)" />
						
						<circle cx="1050" cy="5000" r="70" fill="url(#moonGlow)" opacity="0.5" />
						<circle cx="1050" cy="5000" r="45" fill="#f59e0b" filter="url(#glow)" />
						
						<circle cx="200" cy="10000" r="65" fill="url(#moonGlow)" opacity="0.6" />
						<circle cx="200" cy="10000" r="42" fill="#fbbf24" filter="url(#glow)" />
						
						<circle cx="1000" cy="15000" r="75" fill="url(#moonGlow)" opacity="0.7" />
						<circle cx="1000" cy="15000" r="50" fill="#f59e0b" filter="url(#glow)" />

						{/* Main Path with Glow */}
						<path ref={pathRef} d="M100,400 C300,200 500,700 700,600 C900,500 1100,900 1200,800 L1200,1400 C1100,1600 900,2200 700,2000 C500,1800 300,2400 100,2200 L100,2800 C200,3000 400,3600 600,3400 C800,3200 1000,3800 1100,3600 L1100,4200 C1000,4400 800,5000 600,4800 C400,4600 200,5200 100,5000 L100,5600 C300,5800 500,6400 700,6200 C900,6000 1100,6600 1200,6400 L1200,7000 C1100,7200 900,7800 700,7600 C500,7400 300,8000 100,7800 L100,8400 C200,8600 400,9200 600,9000 C800,8800 1000,9400 1100,9200 L1100,9800 C1000,10000 800,10600 600,10400 C400,10200 200,10800 100,10600 L100,11200 C300,11400 500,12000 700,11800 C900,11600 1100,12200 1200,12000 L1200,12600 C1100,12800 900,13400 700,13200 C500,13000 300,13600 100,13400 L100,14000 C200,14200 400,14800 600,14600 C800,14400 1000,15000 1100,14800 L1100,15200 C1000,15400 800,15800 600,15600" stroke="url(#pathGradient)" strokeWidth="100" fill="none" strokeLinecap="round" filter="url(#glow)" opacity="0.9" />
						<path ref={completedPathRef} d="M100,400 C300,200 500,700 700,600 C900,500 1100,900 1200,800 L1200,1400 C1100,1600 900,2200 700,2000 C500,1800 300,2400 100,2200 L100,2800 C200,3000 400,3600 600,3400 C800,3200 1000,3800 1100,3600 L1100,4200 C1000,4400 800,5000 600,4800 C400,4600 200,5200 100,5000 L100,5600 C300,5800 500,6400 700,6200 C900,6000 1100,6600 1200,6400 L1200,7000 C1100,7200 900,7800 700,7600 C500,7400 300,8000 100,7800 L100,8400 C200,8600 400,9200 600,9000 C800,8800 1000,9400 1100,9200 L1100,9800 C1000,10000 800,10600 600,10400 C400,10200 200,10800 100,10600 L100,11200 C300,11400 500,12000 700,11800 C900,11600 1100,12200 1200,12000 L1200,12600 C1100,12800 900,13400 700,13200 C500,13000 300,13600 100,13400 L100,14000 C200,14200 400,14800 600,14600 C800,14400 1000,15000 1100,14800 L1100,15200 C1000,15400 800,15800 600,15600" stroke="url(#completedGradient)" strokeWidth="100" fill="none" strokeLinecap="round" strokeDasharray="0 1000" style={{ transition: 'stroke-dasharray 0.6s ease' }} filter="url(#glow)" />
						
						{/* Render all 100 level markers */}
						{(() => {
							if (!pathRef.current) return null;
							const total = pathRef.current.getTotalLength();
							
							return levels.map((level) => {
								const point = pathRef.current.getPointAtLength(total * level.percent);
								const isUnlocked = level.id <= userLevel;
								const isCurrent = level.id === userLevel;
								const isMilestone = level.id % 10 === 0;
								
								return (
									<g key={level.id}>
										<circle
											cx={point.x}
											cy={point.y}
											r={isMilestone ? 28 : 20}
											fill={isUnlocked ? (isCurrent ? '#fbbf24' : '#10b981') : '#94a3b8'}
											stroke={isCurrent ? '#f59e0b' : (isUnlocked ? '#059669' : '#64748b')}
											strokeWidth={isCurrent ? 4 : 2}
											opacity={isUnlocked ? 1 : 0.6}
										/>
										{!isUnlocked && (
											<text x={point.x} y={point.y + 6} textAnchor="middle" fontSize={isMilestone ? "18" : "14"} fill="#ffffff" fontWeight="bold">🔒</text>
										)}
										{isUnlocked && (
											<text x={point.x} y={point.y + (isMilestone ? 7 : 6)} textAnchor="middle" fontSize={isMilestone ? "16" : "12"} fill="#ffffff" fontWeight="bold">{level.id}</text>
										)}
										{isMilestone && (
											<text x={point.x} y={point.y - 35} textAnchor="middle" fontSize="11" fill={isUnlocked ? '#059669' : '#64748b'} fontWeight="600">Level {level.id}</text>
										)}
									</g>
								);
							});
						})()}
						
						{/* Render all leaderboard users */}
						{(() => {
							if (!pathRef.current) return null;
							const total = pathRef.current.getTotalLength();
							
							return leaderboardUsers.map((userData, index) => {
								const clamped = Math.min(Math.max(1, userData.level), levels.length);
								const lvl = levels.find(l => l.id === clamped);
								if (!lvl) return null;
								
								const point = pathRef.current.getPointAtLength(total * lvl.percent);
								const isCurrentUser = userData.isCurrentUser;
								const offsetX = index % 3 === 0 ? -100 : index % 3 === 1 ? 0 : 100;
								const offsetY = Math.floor(index / 3) * 50 - 100;
								
								return (
									<g key={userData.id || index}>
										<foreignObject x={point.x - 60 + offsetX} y={point.y - 60 + offsetY} width="120" height="130">
											<div xmlns="http://www.w3.org/1999/xhtml" style={{ width: 120, height: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
												<div 
													style={{ 
														width: isCurrentUser ? 90 : 75, 
														height: isCurrentUser ? 90 : 75, 
														borderRadius: '50%', 
														background: isCurrentUser ? 'linear-gradient(135deg,#00d2ff,#4fc3f7)' : 'linear-gradient(135deg,#a78bfa,#8b5cf6)', 
														display: 'flex', 
														alignItems: 'center', 
														justifyContent: 'center', 
														fontSize: isCurrentUser ? 42 : 36, 
														color: '#fff', 
														fontWeight: 600, 
														border: isCurrentUser ? '5px solid #00d2ff' : '4px solid #8b5cf6', 
														boxShadow: isCurrentUser ? '0 0 28px rgba(0,210,255,0.6), 0 8px 24px rgba(0,0,0,0.25)' : '0 0 20px rgba(139,92,246,0.5), 0 6px 18px rgba(0,0,0,0.2)',
														cursor: 'pointer',
														transition: 'transform 0.2s ease'
													}} 
													title={`${userData.name} - Level ${clamped}`}
													onClick={() => setSelectedUser(userData)}
													onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
													onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
												>
													{userData.avatarEmoji}
												</div>
												<div style={{ 
													marginTop: 8, 
													fontSize: 13, 
													fontWeight: 600, 
													color: isCurrentUser ? '#00509e' : '#5b21b6', 
													background: 'rgba(255,255,255,0.95)', 
													padding: '3px 10px', 
													borderRadius: 12,
													maxWidth: 120,
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap'
												}}>
													{isCurrentUser ? '👑 ' : ''}{userData.name}
												</div>
												<div style={{ 
													fontSize: 11, 
													fontWeight: 500, 
													color: '#555', 
													background: 'rgba(255,255,255,0.85)', 
													padding: '2px 8px', 
													borderRadius: 8,
													marginTop: 3
												}}>
													Lv {clamped}
												</div>
											</div>
										</foreignObject>
									</g>
								);
							});
						})()}
					</svg>
					<div style={infoStyle}>
						{leaderboardUsers.length > 0 ? (
							<>{leaderboardUsers.length} users on map | Max Level: {levels.length}</>
						) : (
							<>Current Level: {Math.min(userLevel, levels.length)} / {levels.length}</>
						)}
					</div>
				</div>
			</div>

			{/* Profile Card Modal */}
			{selectedUser && (
				<div 
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						background: 'rgba(0,0,0,0.4)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 1000,
						backdropFilter: 'blur(4px)'
					}}
					onClick={() => setSelectedUser(null)}
				>
					<div 
						style={{
							background: 'white',
							borderRadius: 16,
							padding: 24,
							boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
							maxWidth: 340,
							width: '90%',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: 16,
							position: 'relative'
						}}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Close Button */}
						<button
							onClick={() => setSelectedUser(null)}
							style={{
								position: 'absolute',
								top: 12,
								right: 12,
								background: 'rgba(0,0,0,0.05)',
								border: 'none',
								borderRadius: '50%',
								width: 32,
								height: 32,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								fontSize: 18,
								color: '#666',
								transition: 'all 0.2s ease'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
								e.currentTarget.style.color = '#000';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
								e.currentTarget.style.color = '#666';
							}}
						>
							×
						</button>

						{/* Avatar */}
						<div 
							style={{
								width: 100,
								height: 100,
								borderRadius: '50%',
								background: selectedUser.isCurrentUser 
									? 'linear-gradient(135deg,#00d2ff,#4fc3f7)' 
									: 'linear-gradient(135deg,#a78bfa,#8b5cf6)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: 48,
								border: selectedUser.isCurrentUser ? '4px solid #00d2ff' : '4px solid #8b5cf6',
								boxShadow: selectedUser.isCurrentUser 
									? '0 8px 24px rgba(0,210,255,0.4)' 
									: '0 8px 24px rgba(139,92,246,0.4)'
							}}
						>
							{selectedUser.avatarEmoji}
						</div>

						{/* User Info */}
						<div style={{ textAlign: 'center', width: '100%' }}>
							<h3 style={{ 
								fontSize: 22, 
								fontWeight: 700, 
								color: '#1a1a1a', 
								marginBottom: 6,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: 6
							}}>
								{selectedUser.isCurrentUser && <span>👑</span>}
								{selectedUser.name}
							</h3>
							<div style={{
								display: 'inline-block',
								background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)',
								padding: '6px 16px',
								borderRadius: 20,
								fontSize: 14,
								fontWeight: 600,
								color: selectedUser.isCurrentUser ? '#0369a1' : '#7c3aed',
								border: `2px solid ${selectedUser.isCurrentUser ? '#00d2ff' : '#a78bfa'}`
							}}>
								Level {selectedUser.level}
							</div>
						</div>

						{/* View Details Button */}
						<button
							onClick={() => {
								setSelectedUser(null);
								if (onNavigate) {
									onNavigate();
								} else {
									onClose && onClose();
								}
								navigate(`/user/profile/${selectedUser.id}`, {
									state: { from: 'progressMap', returnTo: location.pathname }
								});
							}}
							style={{
								width: '100%',
								padding: '12px 24px',
								background: 'linear-gradient(135deg,#00d2ff,#4fc3f7)',
								color: 'white',
								border: 'none',
								borderRadius: 12,
								fontSize: 16,
								fontWeight: 600,
								cursor: 'pointer',
								boxShadow: '0 4px 12px rgba(0,210,255,0.3)',
								transition: 'all 0.2s ease'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-2px)';
								e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,210,255,0.4)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,210,255,0.3)';
							}}
						>
							View Details
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProgressMapContainer;
