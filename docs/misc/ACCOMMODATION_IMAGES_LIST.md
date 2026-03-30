# Accommodation Images Downloaded

All images have been successfully downloaded to `/home/melvin/ratemyaccom/public/images/accommodations/`

## Image Files and Accommodation Mappings

| Accommodation Name | Location | Filename | Path | Format |
|-------------------|----------|----------|------|--------|
| UNSW Kensington Colleges | Kensington (UNSW) | `unsw-kensington-colleges.jpg` | `/home/melvin/ratemyaccom/public/images/accommodations/unsw-kensington-colleges.jpg` | JPEG (2035x1453) |
| Iglu Kensington (Broadway) | Kensington (UNSW) | `iglu-broadway.jpg` | `/home/melvin/ratemyaccom/public/images/accommodations/iglu-broadway.jpg` | JPEG (1400x739) |
| St John's College | Camperdown (University of Sydney) | `st-johns-college.jpg` | `/home/melvin/ratemyaccom/public/images/accommodations/st-johns-college.jpg` | JPEG (1740x1200) |
| Queen Mary Building | Camperdown (University of Sydney) | `queen-mary-building.jpg` | `/home/melvin/ratemyaccom/public/images/accommodations/queen-mary-building.jpg` | JPEG (1520x720) |
| Urbanest Darling House | Haymarket (UTS) | `scape-darling-square.jpg` | `/home/melvin/ratemyaccom/public/images/accommodations/scape-darling-square.jpg` | JPEG (1920x1277) |
| Iglu Central | Haymarket (UTS) | `iglu-central.jpg` | `/home/melvin/ratemyaccom/public/images/accommodations/iglu-central.jpg` | JPEG (1400x739) |
| UniLodge on Broadway | Ultimo (University of Sydney) | `unilodge-ultimo.jpg` | `/home/melvin/ratemyaccom/public/images/accommodations/unilodge-ultimo.jpg` | JPEG (1024x576) |
| Yura Mudang UTS Housing | Ultimo (UTS) | `yura-mudang.jpg` | `/home/melvin/ratemyaccom/public/images/accommodations/yura-mudang.jpg` | JPEG (1920x1080) |
| Dunmore Lang College | North Ryde (Macquarie University) | `dunmore-lang-college.jpg` | `/home/melvin/ratemyaccom/public/images/accommodations/dunmore-lang-college.jpg` | JPEG (7680x4320) |
| Robert Menzies College | North Ryde (Macquarie University) | `robert-menzies-college.jpg` | `/home/melvin/ratemyaccom/public/images/accommodations/robert-menzies-college.jpg` | JPEG (2000x1331) |
| WSU Village Parramatta | Parramatta (Western Sydney University) | `wsu-village-parramatta.jpg` | `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-parramatta.jpg` | JPEG (800x800) |
| UniLodge @ WSU Bankstown | Milperra (Western Sydney University) | `wsu-village-bankstown.jpg` | `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-bankstown.jpg` | JPEG (1200x801) |
| UNSW Village | Kensington (UNSW) | `unsw-village.jpg` | `/home/melvin/ratemyaccom/public/images/accommodations/unsw-village.jpg` | JPEG (2400x1597) |
| Macquarie University Village | North Ryde (Macquarie University) | `macquarie-university-village.jpg` | `/home/melvin/ratemyaccom/public/images/accommodations/macquarie-university-village.jpg` | JPEG (800x800) |
| WSU Village Penrith | Kingswood (Western Sydney University) | `wsu-village-penrith.webp` | `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-penrith.webp` | WebP (698KB) |

## Database Update Format

For updating your database with these image paths, use the relative path format:

```
/images/accommodations/<filename>
```

## Image Sources

All images were sourced from official accommodation websites, architecture portfolio sites, or accommodation listing platforms:

- **UNSW Kensington Colleges**: Archello (Bates Smart Architects)
- **Iglu Properties**: Official Iglu website
- **St John's College**: Official college website
- **Queen Mary Building**: UniLodge official listing
- **Scape Darling Square**: Official Scape website
- **UniLodge on Broadway**: UniLodge official listing
- **Yura Mudang**: Hutchinson Builders project page
- **Dunmore Lang College**: UniAcco listing
- **Robert Menzies College**: ArchDaily (Allen Jack+Cottier Architects)
- **WSU Villages**: Western Sydney University official pages / Campus Living Villages
- **UNSW Village**: Architectus portfolio
- **Macquarie University Village**: Campus Living Villages

## Notes

1. All images are high-quality exterior or representative photos of the accommodations
2. The WSU Village Penrith image is in WebP format (modern web format with excellent compression)
3. All other images are in JPEG format
4. Images range from 64KB to 2.8MB in file size
5. Image dimensions vary but all are web-ready and appropriately sized

## Next Steps

To use these images in your database:

1. Update the `image` or `imageUrl` field in your accommodation records
2. Use the relative path: `/images/accommodations/<filename>`
3. Ensure your Next.js Image component or img tags point to these paths
4. Consider adding alt text descriptions for accessibility
