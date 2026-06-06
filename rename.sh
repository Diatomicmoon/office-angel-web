#!/bin/bash
cd /home/jakob/.openclaw/workspace/office-angel-web

find src public docs -type f -name "*.ts" -o -name "*.tsx" -o -name "*.md" -o -name "*.html" -o -name "*.js" -o -name "*.json" | xargs -I {} bash -c '
    sed -i "s/Office Angel/Hard Hat Solutions/g" "{}"
    sed -i "s/office-angel/hardhat-solutions/g" "{}"
    sed -i "s/officeangel/hardhatsolutions/g" "{}"
    sed -i "s/OfficeAngel/HardHatSolutions/g" "{}"
'
echo "Done"
