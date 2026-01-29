
import os
import argparse

def get_next_medium_dir(base_dir):
    """
    Scans the medium directory for numbered folders and returns the next available one.
    """
    if not os.path.exists(base_dir):
        print(f"Error: Base directory {base_dir} does not exist.")
        return None

    max_num = 0
    # Walk through the directory to find numbered folders
    try:
        items = os.listdir(base_dir)
        for item in items:
            if os.path.isdir(os.path.join(base_dir, item)):
                try:
                    num = int(item)
                    if num > max_num:
                        max_num = num
                except ValueError:
                    continue  # Ignore non-numbered directories
    except Exception as e:
        print(f"Error reading directory: {e}")
        return None

    next_num = max_num + 1
    next_dir_name = f"{next_num:02d}"  # Format as 01, 02, 03...
    next_dir_path = os.path.join(base_dir, next_dir_name)
    
    return next_dir_path

def create_directory(path):
    try:
        os.makedirs(path, exist_ok=True)
        print(path) # Output the path so the agent can read it
        return True
    except Exception as e:
        print(f"Error creating directory: {e}")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Get next Medium post directory")
    parser.add_argument("--base_dir", type=str, default="/Users/ktpro/Desktop/vibe01/medium", help="Base directory for medium posts")
    args = parser.parse_args()

    next_dir = get_next_medium_dir(args.base_dir)
    if next_dir:
        create_directory(next_dir)
