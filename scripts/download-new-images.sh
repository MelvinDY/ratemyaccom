#!/bin/bash

# Download images for new accommodations
cd /home/melvin/ratemyaccom/public/images/accommodations

echo "Downloading images for new accommodations..."

# Iglu Broadway
echo "Downloading Iglu Broadway images..."
curl -sL "https://iglu.com.au/wp-content/uploads/2017/06/Broadway-hero-slider-1400x739-1.jpg" -o "iglu-broadway-1-exterior.jpg"
curl -sL "https://iglu.com.au/wp-content/uploads/2024/11/Iglu-Broadway-Refurb-Studio-Landscape-1.jpg" -o "iglu-broadway-2-studio.jpg"
curl -sL "https://iglu.com.au/wp-content/uploads/2021/03/IgluBroadway-Rooftop-1400x739-1.jpg" -o "iglu-broadway-3-rooftop.jpg"
curl -sL "https://iglu.com.au/wp-content/uploads/2021/03/IgluCentralPark-Gym-1400x739-1.jpg" -o "iglu-broadway-4-gym.jpg"
curl -sL "https://iglu.com.au/wp-content/uploads/2017/06/sbr-hero-3-1.jpg" -o "iglu-broadway-5-common.jpg"

# Iglu Redfern
echo "Downloading Iglu Redfern images..."
curl -sL "https://iglu.com.au/wp-content/uploads/2017/06/Iglu-Redfern-Web-1.jpg" -o "iglu-redfern-1-exterior.jpg"
curl -sL "https://iglu.com.au/wp-content/uploads/2017/11/Iglu-Redfern-380x460-Standard-Studio-1.jpg" -o "iglu-redfern-2-studio.jpg"
curl -sL "https://iglu.com.au/wp-content/uploads/2017/06/Iglu-Redfern-terrace-2.jpg" -o "iglu-redfern-3-terrace.jpg"
curl -sL "https://iglu.com.au/wp-content/uploads/2017/06/Iglu-Redfern-study-2.jpg" -o "iglu-redfern-4-lounge.jpg"
curl -sL "https://iglu.com.au/wp-content/uploads/2021/03/sre-hero-2.jpg" -o "iglu-redfern-5-common.jpg"

# Iglu Chatswood
echo "Downloading Iglu Chatswood images..."
curl -sL "https://iglu.com.au/wp-content/uploads/2017/06/Chatswood-lobby-1400x739-2.jpg" -o "iglu-chatswood-1-lobby.jpg"
curl -sL "https://iglu.com.au/wp-content/uploads/2017/10/Iglu-Chatswood-380x460-Standard-Studio-1-1.jpg" -o "iglu-chatswood-2-studio.jpg"
curl -sL "https://iglu.com.au/wp-content/uploads/2017/06/Chatswood-study-1400x739-3.jpg" -o "iglu-chatswood-3-study.jpg"
curl -sL "https://iglu.com.au/wp-content/uploads/2017/06/Chatswood-communal-1400x739-5.jpg" -o "iglu-chatswood-4-communal.jpg"
curl -sL "https://iglu.com.au/wp-content/uploads/2017/06/Chatswood-courtyard-edit.jpg" -o "iglu-chatswood-5-courtyard.jpg"

# Scape at University of Sydney
echo "Downloading Scape USYD images..."
curl -sL "https://cdn.scape.com.au/cdn-cgi/imagedelivery/TOESH0qEsuV1ljtDfMkhNw/9212a591-af11-4f77-199d-20f41da3cc00/w=1400" -o "scape-usyd-1-exterior.jpg"
curl -sL "https://cdn.scape.com.au/cdn-cgi/imagedelivery/TOESH0qEsuV1ljtDfMkhNw/6baf3dbe-f955-47dc-6dbf-6a2e467d3200/w=1400" -o "scape-usyd-2-building.jpg"
curl -sL "https://cdn.scape.com.au/cdn-cgi/imagedelivery/TOESH0qEsuV1ljtDfMkhNw/7268d63c-3265-4237-d803-2014dafcb700/w=1400" -o "scape-usyd-3-study.jpg"
curl -sL "https://cdn.scape.com.au/cdn-cgi/imagedelivery/TOESH0qEsuV1ljtDfMkhNw/349da419-c3bd-4297-d595-5d92d4a55e00/w=1400" -o "scape-usyd-4-room.jpg"

# Scape Redfern
echo "Downloading Scape Redfern images..."
curl -sL "https://cdn.scape.com.au/cdn-cgi/imagedelivery/TOESH0qEsuV1ljtDfMkhNw/6f3b2fd4-f7d6-45f0-d361-2dae549d1300/w=1400" -o "scape-redfern-1-exterior.jpg"

# Scape Darling Square
echo "Downloading Scape Darling Square images..."
curl -sL "https://cdn.scape.com.au/cdn-cgi/imagedelivery/TOESH0qEsuV1ljtDfMkhNw/78d27b05-c22d-47a9-6cbd-5b0f0facfd00/w=1400" -o "scape-darling-square-1-exterior.jpg"

# Scape Quay
echo "Downloading Scape Quay images..."
curl -sL "https://cdn.scape.com.au/cdn-cgi/imagedelivery/TOESH0qEsuV1ljtDfMkhNw/0aaf7d17-ce7b-4072-8a15-e381a81b1500/w=1400" -o "scape-quay-1-exterior.jpg"

# Scape Kensington
echo "Downloading Scape Kensington images..."
curl -sL "https://cdn.scape.com.au/cdn-cgi/imagedelivery/TOESH0qEsuV1ljtDfMkhNw/ee1c53dd-3971-4396-cf2e-0b0317a3c000/w=1400" -o "scape-kensington-1-exterior.jpg"

# Scape Kingsford
echo "Downloading Scape Kingsford images..."
curl -sL "https://cdn.scape.com.au/cdn-cgi/imagedelivery/TOESH0qEsuV1ljtDfMkhNw/d317a479-3eae-4d96-7285-01cff991a100/w=1400" -o "scape-kingsford-1-exterior.jpg"

# Scape Lachlan
echo "Downloading Scape Lachlan images..."
curl -sL "https://cdn.scape.com.au/cdn-cgi/imagedelivery/TOESH0qEsuV1ljtDfMkhNw/d51961e1-7288-4730-0e4a-63f4bc20b700/w=1400" -o "scape-lachlan-1-exterior.jpg"

echo "Done downloading images!"
ls -la *.jpg 2>/dev/null | wc -l
echo "images downloaded"
