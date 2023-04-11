npm install
npm install --save @types/requirejs

echo "Now edit node_modules/phaser/types/phaser.d.ts  ^
      scroll to the end of the file and replace       ^
      declare module 'phaser' {                       ^
      with                                            ^
      declare module 'Phaser' {"
      
notepad.exe node_modules/phaser/types/phaser.d.ts

pause
      