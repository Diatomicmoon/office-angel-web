import re

with open('src/app/supply-runner/page.tsx', 'r') as f:
    content = f.read()

# Replace DEFAULT_KITS with empty array
content = re.sub(
    r'const DEFAULT_KITS: PresetKit\[\] = \[.*?\];',
    'const DEFAULT_KITS: PresetKit[] = [];',
    content,
    flags=re.DOTALL
)

with open('src/app/supply-runner/page.tsx', 'w') as f:
    f.write(content)
