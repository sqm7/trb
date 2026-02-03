import re

with open('index.html', 'r') as f:
    content = f.read()

hrefs = re.findall(r'href="([^"]*)"', content)
srcs = re.findall(r'src="([^"]*)"', content)

print("HREFS:")
for h in hrefs:
    if h.startswith('/') and not h.startswith('/trb'):
        print(f"MISSING: {h}")

print("\nSRCS:")
for s in srcs:
    if s.startswith('/') and not s.startswith('/trb'):
        print(f"MISSING: {s}")
