@echo off
echo Iniciando POS Táctil...
start "POS Táctil" java -jar target\Pos_tactil-0.0.1-SNAPSHOT.jar
timeout /t 5 >nul
start http://localhost:8080
pause