@echo off
echo Iniciando POS Táctil...
start http://localhost:8080
java -jar target\Pos_tactil-0.0.1-SNAPSHOT.jar
pause

