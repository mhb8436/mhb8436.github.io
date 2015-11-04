cd ..
tar cvfz realestate.tar.gz --exclude='web/.idea' --exclude='web/node_modules' --exclude='web/redis-3.0.0' --exclude='web/nohup.out' --exclude='web/bower_components' --exclude='web/*.db'  web/
export SSHPASS=ap11040621
sshpass -e sftp -i ~/.ssh/mhb8436.pem root@133.130.49.197 << !
   put realestate.tar.gz
   bye
!

sshpass -e ssh -i ~/.ssh/mhb8436.pem root@133.130.49.197 << !
	tar xvfz  realestate.tar.gz
!
