import re

with open('src/app/api/dashboard/route.ts', 'r') as f:
    content = f.read()

content = re.sub(r'qbGrossProfit = 18450\.00;', 'qbGrossProfit = 0;', content)
content = re.sub(r'qbTotalExpenses = 5120\.00;', 'qbTotalExpenses = 0;', content)
content = re.sub(r'qbNetIncome = 13330\.00;', 'qbNetIncome = 0;', content)

# Wait, what if there are default values for findTotal?
content = re.sub(r'qbGrossProfit = findTotal\(reportData\.Rows\.Row, "Gross Profit"\) \|\| 15420\.50;', 'qbGrossProfit = findTotal(reportData.Rows.Row, "Gross Profit") || 0;', content)
content = re.sub(r'qbTotalExpenses = findTotal\(reportData\.Rows\.Row, "Total Expenses"\) \|\| 4210\.00;', 'qbTotalExpenses = findTotal(reportData.Rows.Row, "Total Expenses") || 0;', content)
content = re.sub(r'qbNetIncome = findTotal\(reportData\.Rows\.Row, "Net Income"\) \|\| findTotal\(reportData\.Rows\.Row, "Net Operating Income"\) \|\| 11210\.50;', 'qbNetIncome = findTotal(reportData.Rows.Row, "Net Income") || findTotal(reportData.Rows.Row, "Net Operating Income") || 0;', content)

with open('src/app/api/dashboard/route.ts', 'w') as f:
    f.write(content)
