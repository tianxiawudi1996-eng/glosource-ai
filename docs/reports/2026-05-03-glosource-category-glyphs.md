# GloSource Category Glyph Set

Date: 2026-05-03

## Purpose

Replace cheap-looking Unicode emoji with a GloSource-native SVG glyph system.

The glyphs are repo-native React/SVG components, not external image files. This keeps category boxes sharp at small sizes, color-consistent, and easy to reuse across the UI.

## Files

- `app/components/CategoryGlyph.tsx`
- `app/components/CategorySelector.tsx`

## First 50 Custom Glyphs

These 50 glyphs are directly mapped to category codes.

1. `STL_REBAR` → `rebar`
2. `STL_PIPE` → `steelPipe`
3. `STL_BEAM` → `hBeam`
4. `STL_SHEET` → `steelSheet`
5. `STL_GALV` → `galvCoil`
6. `STL_ANGLE` → `angleSteel`
7. `STL_WIRE` → `wireMesh`
8. `STL_STUD` → `steelStud`
9. `STL_CAST` → `castPipe`
10. `STL_DECK` → `deckPlate`
11. `ALU_WIN` → `windowFrame`
12. `ALU_EXTRUDE` → `aluExtrusion`
13. `ALU_SHEET` → `aluSheet`
14. `ALU_CURTAIN` → `curtainWall`
15. `ALU_SOLAR` → `solarFrame`
16. `ALU_ROOF` → `aluRoof`
17. `ALU_COMPOSITE` → `acpPanel`
18. `ALU_TUBE` → `aluTube`
19. `ALU_LOUVER` → `louver`
20. `ALU_CAST` → `dieCast`
21. `CON_CEMENT` → `cementBag`
22. `CON_BLOCK` → `conBlock`
23. `CON_PIPE` → `rcPipe`
24. `CON_PANEL` → `precastPanel`
25. `CON_PILE` → `phcPile`
26. `CON_READY` → `readyMix`
27. `CON_PAVING` → `pavingBlock`
28. `CON_HOLLOW` → `hollowSlab`
29. `CON_FIBER` → `fiberBoard`
30. `CON_GROUT` → `grout`
31. `STO_MARBLE` → `marble`
32. `STO_GRANITE` → `granite`
33. `STO_PORCELAIN` → `porcelainTile`
34. `STO_SLATE` → `slate`
35. `STO_CERAMIC` → `ceramicTile`
36. `STO_MOSAIC` → `mosaic`
37. `STO_QUARTZ` → `quartz`
38. `STO_TERRACOTTA` → `terracotta`
39. `STO_CULTURED` → `culturedStone`
40. `STO_ACID` → `acidBrick`
41. `WOD_PLYWOOD` → `plywood`
42. `WOD_OSB` → `osb`
43. `GLS_FLOAT` → `floatGlass`
44. `INS_XPS` → `xpsBoard`
45. `MEP_PPR` → `pprPipe`
46. `ELC_CABLE` → `powerCable`
47. `MCH_SCAFFOLD` → `scaffold`
48. `AIR_ARM` → `robotArm`
49. `ITH_SERVER` → `serverRack`
50. `SMF_IOT` → `iotSensor`

## Fallback Glyphs

Unmapped category codes fall back to their L1 category glyph:

- `STEEL` → `steel`
- `ALUMINUM` → `aluminum`
- `CONCRETE` → `concrete`
- `STONE` → `stone`
- `WOOD` → `wood`
- `GLASS` → `glass`
- `INSULATION` → `insulation`
- `MEP` → `mep`
- `ELECTRICAL` → `electrical`
- `MACHINERY` → `machinery`
- `AI_ROBOT` → `robotics`
- `IT_HARDWARE` → `itHardware`
- `SMART_MFG` → `smartFactory`

## Applied UI

- Selected category pill
- Construction L1 category boxes
- Construction L2 category chips
- Tech industry category cards
- Tech industry L2 category chips

## Next Extension

If more precision is needed, map remaining category codes in `CATEGORY_GLYPH_MAP` inside `app/components/CategoryGlyph.tsx`.
