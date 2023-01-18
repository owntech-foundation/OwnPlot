#MacOS stuff
mkdir Icon.iconset
sips -z 16 16     $1 --out Icon.iconset/icon_16x16.png
sips -z 32 32     $1 --out Icon.iconset/icon_16x16@2x.png
sips -z 32 32     $1 --out Icon.iconset/icon_32x32.png
sips -z 64 64     $1 --out Icon.iconset/icon_32x32@2x.png
sips -z 128 128   $1 --out Icon.iconset/icon_128x128.png
sips -z 256 256   $1 --out Icon.iconset/icon_128x128@2x.png
sips -z 512 512   $1 --out Icon.iconset/icon_512x512.png
sips -z 1024 1024  $1 --out Icon.iconset/icon_512x512@2x.png
cp $1 Icon.iconset/icon_1024x1024.png

iconutil -c icns Icon.iconset

#Windows stuff
convert $1 -define icon:auto-resize=256,64,48,32,16 Icon.ico

#Linux stuff
cp $1 Icon.png
#rm -R MyIcon.iconset
