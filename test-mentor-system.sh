#!/bin/bash

echo "🧪 Testing Mentor System"
echo "========================"

echo ""
echo "1. Starting backend..."
cd server && npm run dev &
SERVER_PID=$!
sleep 3

echo ""
echo "2. Checking mentor count..."
curl -s http://localhost:4000/api/mentors | jq 'length'

echo ""
echo "3. Starting frontend..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ System running!"
echo "   Backend: http://localhost:4000"
echo "   Frontend: http://localhost:5173"
echo "   Mentors page: http://localhost:5173/user/mentors"
echo ""
echo "Press Ctrl+C to stop"

trap "kill $SERVER_PID $FRONTEND_PID" EXIT
wait
