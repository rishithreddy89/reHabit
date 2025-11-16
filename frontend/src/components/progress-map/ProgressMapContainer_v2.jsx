import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { API } from '@/lib/config';

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

const ProgressMapContainer = ({ onClose, user, currentUserId }) => {
	const levels = buildLevels();
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
						avatarEmoji: entry.avatar?.emoji || '🧑',
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
	const containerStyle = { position: 'relative', width: '100%', height: '100%', fontFamily: 'Inter, system-ui, sans-serif', background: 'linear-gradient(135deg,#d4f1f9,#b3e5fc)', display: 'flex', alignItems: 'stretch', justifyContent: 'stretch', overflow: 'hidden' };
	const phoneStyle = { width: '100%', height: '100%', background: 'linear-gradient(180deg,#d4f1f9,#e0f7fa)', position: 'relative', overflow: 'hidden' };
	const headerStyle = { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(0,0,0,0.06)' };
	const btnBase = { padding: '8px 14px', borderRadius: 999, fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: 14 };
	const btnLevelUp = { ...btnBase, background: '#00d2ff', color: '#fff', boxShadow: '0 4px 12px rgba(0,210,255,0.3)' };
	const btnClose = { ...btnBase, background: 'rgba(255,255,255,0.85)', color: '#222', border: '1px solid rgba(0,0,0,0.08)' };
	const canvasStyle = { position: 'relative', width: '100%', height: 'calc(100% - 60px)', padding: 20, overflow: 'auto' };
	const infoStyle = { position: 'absolute', left: 16, bottom: 16, background: 'rgba(255,255,255,0.85)', padding: '8px 12px', borderRadius: 8, fontSize: 12, color: '#045', fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' };

	return (
		<div style={containerStyle}>
			<div style={phoneStyle}>
				<div style={headerStyle}>
					{!user && <button style={btnLevelUp} onClick={levelUp}>Level Up</button>}
						<button style={btnClose} onClick={handleClose}>Close</button>
					<div style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: '#033' }}>
						{leaderboardUsers.length > 0 ? `Top ${leaderboardUsers.length} Users` : `Level ${Math.min(userLevel, levels.length)} / ${levels.length}`}
					</div>
				</div>
				<div style={canvasStyle} ref={canvasRef}>
					<svg viewBox="0 0 1200 8000" preserveAspectRatio="xMidYMin meet" style={{ width: '100%', height: 'auto', minHeight: '6000px', position: 'relative' }}>
						<defs>
							<linearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="1">
								<stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
								<stop offset="100%" stopColor="#60a5fa" stopOpacity="1" />
							</linearGradient>
							<linearGradient id="completedGradient" x1="0" y1="0" x2="1" y2="1">
								<stop offset="0%" stopColor="#10b981" />
								<stop offset="100%" stopColor="#34d399" />
							</linearGradient>
						</defs>
						<path ref={pathRef} d="M100,200 C300,100 500,400 700,300 C900,200 1100,500 1200,400 L1200,800 C1100,900 900,1200 700,1100 C500,1000 300,1300 100,1200 L100,1600 C200,1700 400,2000 600,1900 C800,1800 1000,2100 1100,2000 L1100,2400 C1000,2500 800,2800 600,2700 C400,2600 200,2900 100,2800 L100,3200 C300,3100 500,3400 700,3300 C900,3200 1100,3500 1200,3400 L1200,3800 C1100,3900 900,4200 700,4100 C500,4000 300,4300 100,4200 L100,4600 C200,4700 400,5000 600,4900 C800,4800 1000,5100 1100,5000 L1100,5400 C1000,5500 800,5800 600,5700 C400,5600 200,5900 100,5800 L100,6200 C300,6100 500,6400 700,6300 C900,6200 1100,6500 1200,6400 L1200,6800 C1100,6900 900,7200 700,7100 C500,7000 300,7300 100,7200 L100,7600 C200,7700 400,7950 600,7850" stroke="url(#pathGradient)" strokeWidth="60" fill="none" strokeLinecap="round" />
						<path ref={completedPathRef} d="M100,200 C300,100 500,400 700,300 C900,200 1100,500 1200,400 L1200,800 C1100,900 900,1200 700,1100 C500,1000 300,1300 100,1200 L100,1600 C200,1700 400,2000 600,1900 C800,1800 1000,2100 1100,2000 L1100,2400 C1000,2500 800,2800 600,2700 C400,2600 200,2900 100,2800 L100,3200 C300,3100 500,3400 700,3300 C900,3200 1100,3500 1200,3400 L1200,3800 C1100,3900 900,4200 700,4100 C500,4000 300,4300 100,4200 L100,4600 C200,4700 400,5000 600,4900 C800,4800 1000,5100 1100,5000 L1100,5400 C1000,5500 800,5800 600,5700 C400,5600 200,5900 100,5800 L100,6200 C300,6100 500,6400 700,6300 C900,6200 1100,6500 1200,6400 L1200,6800 C1100,6900 900,7200 700,7100 C500,7000 300,7300 100,7200 L100,7600 C200,7700 400,7950 600,7850" stroke="url(#completedGradient)" strokeWidth="60" fill="none" strokeLinecap="round" strokeDasharray="0 1000" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
						
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
								const offsetX = index % 3 === 0 ? -60 : index % 3 === 1 ? 0 : 60;
								const offsetY = Math.floor(index / 3) * 30 - 60;
								
								return (
									<g key={userData.id || index}>
										<foreignObject x={point.x - 40 + offsetX} y={point.y - 40 + offsetY} width="80" height="90">
											<div xmlns="http://www.w3.org/1999/xhtml" style={{ width: 80, height: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
												<div style={{ 
													width: isCurrentUser ? 68 : 56, 
													height: isCurrentUser ? 68 : 56, 
													borderRadius: '50%', 
													background: isCurrentUser ? 'linear-gradient(135deg,#00d2ff,#4fc3f7)' : 'linear-gradient(135deg,#a78bfa,#8b5cf6)', 
													display: 'flex', 
													alignItems: 'center', 
													justifyContent: 'center', 
													fontSize: isCurrentUser ? 32 : 26, 
													color: '#fff', 
													fontWeight: 600, 
													border: isCurrentUser ? '4px solid #00d2ff' : '3px solid #8b5cf6', 
													boxShadow: isCurrentUser ? '0 0 22px rgba(0,210,255,0.55), 0 6px 18px rgba(0,0,0,0.2)' : '0 0 16px rgba(139,92,246,0.4), 0 4px 12px rgba(0,0,0,0.15)' 
												}} 
												title={`${userData.name} - Level ${clamped}`}
												>
													{userData.avatarEmoji}
												</div>
												<div style={{ 
													marginTop: 6, 
													fontSize: 10, 
													fontWeight: 600, 
													color: isCurrentUser ? '#00509e' : '#5b21b6', 
													background: 'rgba(255,255,255,0.95)', 
													padding: '2px 8px', 
													borderRadius: 12,
													maxWidth: 80,
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap'
												}}>
													{isCurrentUser ? '👑 ' : ''}{userData.name}
												</div>
												<div style={{ 
													fontSize: 9, 
													fontWeight: 500, 
													color: '#555', 
													background: 'rgba(255,255,255,0.85)', 
													padding: '1px 6px', 
													borderRadius: 8,
													marginTop: 2
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
		</div>
	);
};

export default ProgressMapContainer;
