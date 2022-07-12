
mkdir MyIcon.iconset
sips -z 16 16     $1.png --out MyIcon.iconset/icon_16x16.png
sips -z 32 32     $1.png --out MyIcon.iconset/icon_16x16@2x.png
sips -z 32 32     $1.png --out MyIcon.iconset/icon_32x32.png
sips -z 64 64     $1.png --out MyIcon.iconset/icon_32x32@2x.png
sips -z 128 128   $1.png --out MyIcon.iconset/icon_128x128.png
sips -z 256 256   $1.png --out MyIcon.iconset/icon_128x128@2x.png
cp $1.png MyIcon.iconset/icon_256x256.png

iconutil -c icns MyIcon.iconset
#rm -R MyIcon.iconset
