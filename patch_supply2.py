import re

with open('src/app/supply-runner/page.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'// Supabase empty or table not yet created — check localStorage\s*const saved = localStorage\.getItem\("supplyRunnerItems"\);\s*if \(saved\) setItems\(JSON\.parse\(saved\)\);',
    '// Supabase empty — clear local storage as well to remove fake data\n          localStorage.removeItem("supplyRunnerItems");\n          setItems([]);',
    content
)

content = re.sub(
    r'\.catch\(\(\) => \{\s*const saved = localStorage\.getItem\("supplyRunnerItems"\);\s*if \(saved\) setItems\(JSON\.parse\(saved\)\);\s*\}\);',
    '.catch(() => {\n        localStorage.removeItem("supplyRunnerItems");\n        setItems([]);\n      });',
    content
)

with open('src/app/supply-runner/page.tsx', 'w') as f:
    f.write(content)
