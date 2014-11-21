cd ../
tar cvfz ctrladm.tar.gz --exclude='ctrladm/.idea'  --exclude='ctrladm/node_modules' --exclude='ctrladm/bower_components' ctrladm
export SSHPASS=ap11040621
sshpass -e sftp -oBatchMode=no -b - apdev@netcurve.airplug.com << !
   cd canal
   put ctrladm.tar.gz
   bye
!

sshpass -e ssh apdev@netcurve.airplug.com << !
cd canal
tar xvfz  ctrladm.tar.gz
exit 
!
