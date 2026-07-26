import os

dir_path = "/home/fique/Documents/6ty7ers/6ty7ers-frontend/src/components/staff"

for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith(".jsx"):
            file_path = os.path.join(root, file)
            with open(file_path, "r") as f:
                content = f.read()
            
            # Revert the breakpoints back to lg: as they were in the original CSS
            new_content = content.replace("md:flex", "lg:flex")
            new_content = new_content.replace("md:hidden", "lg:hidden")
            new_content = new_content.replace("md:grid-cols-[240px_1fr]", "lg:grid-cols-[240px_1fr]")
            new_content = new_content.replace("md:flex-col", "lg:flex-col")
            new_content = new_content.replace("md:grid-cols-2", "lg:grid-cols-2")
            new_content = new_content.replace("md:grid-cols-4", "lg:grid-cols-4")
            
            if new_content != content:
                with open(file_path, "w") as f:
                    f.write(new_content)
                print(f"Reverted {file_path}")
