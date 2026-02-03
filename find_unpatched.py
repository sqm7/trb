import os
import re

root_dir = "/Users/ktpro/Desktop/vibe01"
subpath = "/trb"

# Common routes to check
routes = ["/dashboard", "/pricing", "/map", "/settings", "/announcements", "/reports", "/tools", "/auth", "/icon.png"]

for root, dirs, files in os.walk(root_dir):
    if '.git' in dirs:
        dirs.remove('.git')
    for file in files:
        if file.endswith(('.js', '.html', '.txt')):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                for route in routes:
                    # Check for "/route" or '/route' or `/route`
                    patterns = [
                        f'"{route}"', f"'{route}'", f'`{route}`',
                        f'"{route}/"', f"'{route}/'", f'`{route}/`',
                        f'href="{route}"', f"href='{route}'",
                        f'push("{route}"', f"push('{route}'"
                    ]
                    for p in patterns:
                        if p in content:
                            print(f"FOUND {p} in {file_path}")
            except:
                pass
