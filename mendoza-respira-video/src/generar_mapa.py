"""Genera src/mapa.html (SVG inline) desde el GeoJSON de departamentos de la app.
Uso: python3 src/generar_mapa.py ruta/a/mendoza-departamentos.geojson
Los totales son DATOS DE EJEMPLO para el video, no salen de la base real."""
import json, math, random, sys
W, H = 549, 900
W0, E0, S0, N0 = -70.6, -66.45, -37.6, -32.0
px = lambda lon: (lon - W0) / (E0 - W0) * W
py = lambda lat: (N0 - lat) / (N0 - S0) * H
EJ = {'Capital':41,'Godoy Cruz':38,'Guaymallén':52,'Las Heras':33,'Luján de Cuyo':21,'Maipú':29,'Lavalle':6,
      'San Martín':47,'Junín':18,'Rivadavia':22,'Santa Rosa':5,'La Paz':3,'Tunuyán':12,'Tupungato':7,
      'San Carlos':4,'San Rafael':26,'General Alvear':9,'Malargüe':2}
TOWN = {'Malargüe':(-35.47,-69.58),'San Rafael':(-34.61,-68.33),'General Alvear':(-34.98,-67.69),'San Carlos':(-33.77,-69.04),
 'Tunuyán':(-33.58,-69.02),'Tupungato':(-33.37,-69.15),'Luján de Cuyo':(-33.04,-68.88),'Las Heras':(-32.85,-68.83),
 'Lavalle':(-32.72,-68.59),'La Paz':(-33.46,-67.56),'Santa Rosa':(-33.25,-68.15),'Rivadavia':(-33.19,-68.46),
 'Junín':(-33.15,-68.49),'San Martín':(-33.08,-68.47),'Maipú':(-32.98,-68.78),'Guaymallén':(-32.90,-68.79),
 'Godoy Cruz':(-32.93,-68.85),'Capital':(-32.89,-68.84)}
STEPS = ['#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026']
def step(n): return 0 if n<=10 else 1 if n<=20 else 2 if n<=30 else 3 if n<=42 else 4
TYPES = ['#dc2626','#e11d48','#a16207','#0ea5e9','#14b8a6','#ef4444','#f59e0b','#6366f1']
d = json.load(open(sys.argv[1])); random.seed(7); out=[]; pts=[]
feats = sorted(d['features'], key=lambda f: -len(f['geometry']['coordinates'][0]))
for f in feats:
    n = f['properties']['nombre']; rings = f['geometry']['coordinates']
    dd = ''.join('M' + 'L'.join(f'{px(x):.1f},{py(y):.1f}' for x, y in r) + 'Z' for r in rings)
    lat, lon = TOWN[n]
    out.append(f'<path class="depto" data-n="{n}" data-total="{EJ[n]}" data-cx="{px(lon):.0f}" data-cy="{py(lat):.0f}" style="--c:{STEPS[step(EJ[n])]}" d="{dd}"/>')
    for i in range(max(1, EJ[n] // 4)):
        s = 0.035 if EJ[n] > 15 else 0.05
        pts.append(f'<circle class="pt" cx="{px(lon + random.gauss(0, s)):.1f}" cy="{py(lat + random.gauss(0, s * .8)):.1f}" r="3.2" fill="{random.choice(TYPES)}"/>')
random.shuffle(pts)
open(__file__.replace('generar_mapa.py', 'mapa.html'), 'w').write(
  f'<svg class="mapa" viewBox="-6 -6 {W+12} {H+12}" role="img" aria-label="Mapa de Mendoza por departamento">\n<g class="deptos">\n' + '\n'.join(out) + '\n</g>\n<g class="pts">\n' + '\n'.join(pts) + '\n</g>\n</svg>\n')
print(len(out), 'deptos', len(pts), 'puntos')
