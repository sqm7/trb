import os

root_dir = "/Users/ktpro/Desktop/vibe01"
subpath = "/trb"

# List of routes/assets to prefix
routes = [
    "dashboard", "pricing", "map", "settings", "announcements", 
    "reports", "tools", "admin", "auth", "alchemy", "share", "render-animation",
    "_next", "images", "logo-type-a.jpg", "icon.png", "favicon.ico", "manifest.json", "apple-icon.png"
]

def patch_content(content):
    patched = False
    for route in routes:
        # Various patterns: "/route", '/route', `/route`, ":"/route", etc.
        # We look for a slash followed by the route name, ensuring not already prefixed
        
        # Double quotes
        target = f'"/{route}'
        if target in content and f'"{subpath}/{route}' not in content:
            content = content.replace(target, f'"{subpath}/{route}')
            patched = True
            
        # Single quotes
        target = f"'{route}"
        # Wait, '/route'
        target = f"'/{route}"
        if target in content and f"'{subpath}/{route}" not in content:
            content = content.replace(target, f"'{subpath}/{route}")
            patched = True
            
        # Backticks
        target = f"`/{route}"
        if target in content and f"`{subpath}/{route}" not in content:
            content = content.replace(target, f"`{subpath}/{route}")
            patched = True
            
        # Handle cases like :"/dashboard" which might be in JSON or minified objects
        target = f':"/{route}'
        if target in content and f':"{subpath}/{route}' not in content:
            content = content.replace(target, f':"{subpath}/{route}')
            patched = True

    # Special case for root /
    # For push("/") or href="/"
    for quote in ['"', "'", '`']:
        target = f"{quote}/{quote}"
        if target in content and f"{quote}{subpath}/{quote}" not in content:
            content = content.replace(target, f"{quote}{subpath}/{quote}")
            patched = True
            
    return content, patched

for root, dirs, files in os.walk(root_dir):
    if '.git' in dirs:
        dirs.remove('.git')
    for file in files:
        if file.endswith(('.html', '.js', '.txt', '.css', '.json')):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content, is_patched = patch_content(content)
                
                if is_patched:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Patched: {file_path}")
            except Exception as e:
                print(f"Error patching {file_path}: {e}")
