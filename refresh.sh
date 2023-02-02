#git pull
cp -r WebContent/* /var/www/html/.
for x in `find /var/www/html/ -name '*.PNG'`; 
do mv $x ${x%PNG}png;  
done;
