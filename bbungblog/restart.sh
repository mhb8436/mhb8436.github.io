kill -9 `ps -aef | grep node | grep admin.js | grep -v grep | awk '{print $2}'`
nohup node admin.js &
tail -f nohup.out

