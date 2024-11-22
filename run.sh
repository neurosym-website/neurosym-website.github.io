#If you have python installed, you can run this file to display your downloaded project.
#For most projects, you can just open the view.html file directly, but most modern browsers
#are very picky when it comes to opening files directly from your local file system, so 
#in particular, projects that use the playskript 'canvas' construct might not display 
#correctly unless you run them through a web server using this command. 

python3 -m http.server 8080  | python3 -mwebbrowser http://localhost:8080/index.html
