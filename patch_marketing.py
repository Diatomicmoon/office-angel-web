import re

with open('src/app/marketing/page.tsx', 'r') as f:
    content = f.read()

# 1. Zero out metrics
content = re.sub(
    r'<p className="text-3xl font-bold text-gray-900">4,281</p>\s*<div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-green-600">\s*<TrendingUp size=\{14\} /> \+12% vs last month\s*</div>',
    '<p className="text-3xl font-bold text-gray-400">0</p>\n          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-gray-400">\n            <TrendingUp size={14} /> Connect account\n          </div>',
    content
)

content = re.sub(
    r'<p className="text-3xl font-bold text-gray-900">142</p>\s*<div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-green-600">\s*<TrendingUp size=\{14\} /> \+5% vs last month\s*</div>',
    '<p className="text-3xl font-bold text-gray-400">0</p>\n          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-gray-400">\n            <TrendingUp size={14} /> Connect account\n          </div>',
    content
)

content = re.sub(
    r'<p className="text-3xl font-bold text-gray-900">856</p>\s*<div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-red-600">\s*<TrendingDown size=\{14\} /> -2% vs last month\s*</div>',
    '<p className="text-3xl font-bold text-gray-400">0</p>\n          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-gray-400">\n            <TrendingDown size={14} /> Connect account\n          </div>',
    content
)

content = re.sub(
    r'<p className="text-3xl font-bold text-gray-900 flex items-center gap-2">\s*4.9 <Star size=\{24\} className="fill-yellow-400 text-yellow-400" />\s*</p>\s*<div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-gray-500">\s*Based on 144 total reviews\s*</div>',
    '<p className="text-3xl font-bold text-gray-400 flex items-center gap-2">\n            0.0 <Star size={24} className="text-gray-300" />\n          </p>\n          <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-gray-400">\n            No reviews yet\n          </div>',
    content
)

# 2. Fix SEO Heatmap Overlay
content = re.sub(
    r'\{\[2, 1, 1, 3, 1, 2, 7, 4, 3\]\.map\(\(rank, i\) => \(\s*<div key=\{i\} className=\{`aspect-square rounded-full flex flex-col items-center justify-center border-4 shadow-lg transform transition-transform pointer-events-auto hover:scale-110 cursor-pointer \$\{\s*rank <= 3 \? \'bg-green-500 border-white text-white\' : \s*rank <= 5 \? \'bg-yellow-400 border-white text-white\' : \'bg-red-500 border-white text-white\'\s*\}`\}>\s*<span className="text-2xl font-black">\{rank\}</span>\s*</div>\s*\)\)\}',
    '{[0, 0, 0, 0, 0, 0, 0, 0, 0].map((rank, i) => (\n                <div key={i} className={`aspect-square rounded-full flex flex-col items-center justify-center border-4 shadow-lg transform transition-transform pointer-events-auto bg-gray-300 border-white text-white opacity-50`}>\n                  <span className="text-xl font-bold">-</span>\n                </div>\n              ))}',
    content
)

content = re.sub(
    r'<Search size=\{16\} className="text-blue-600" /> AI Ranking Analysis\s*</h4>\s*<p className="text-xs text-gray-700">\s*You are ranking <strong>#1</strong> in the center of town, but dropping to <strong>#7</strong> in the Southwest quadrant. \s*<strong className="text-blue-600 ml-1 cursor-pointer hover:underline">Generate a geo-tagged post about "Southwest Service Calls" to boost ranking here.</strong>\s*</p>',
    '<Search size={16} className="text-gray-400" /> AI Ranking Analysis\n              </h4>\n              <p className="text-xs text-gray-500">\n                Connect your Google Business Profile to see localized SEO ranking heatmaps and receive AI suggestions.\n              </p>',
    content
)

# 3. Clear Fake Uploaded Photo
content = re.sub(
    r'\{/\* Fake uploaded photo \*/\}\s*<img src="https://images.unsplash.com/photo[^>]+>\s*</div>\s*</div>',
    '{/* Empty upload state */}\n                <div className="flex flex-col items-center justify-center text-gray-400">\n                  <Camera size={24} className="mb-2" />\n                  <span className="text-sm font-medium">Click to upload</span>\n                </div>\n              </div>\n            </div>',
    content
)

# 4. Clear Fake Post Generation
content = re.sub(
    r'<button className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">\s*<RefreshCw size=\{12\} /> Regenerate\s*</button>\s*</div>\s*<textarea \s*className="w-full p-4 border border-gray-300 rounded-xl text-sm text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" \s*rows=\{5\}\s*defaultValue="Just finished up a massive 200 Amp service upgrade for a great customer in Maple Grove! ⚡ If you\'re dealing with an old Federal Pacific panel or need more power for an EV charger, give us a call. We are fully licensed, insured, and ready to roll. \\n\\n#Electrician #MapleGroveMN #PanelUpgrade #HomeImprovement #TradeVolt"\s*></textarea>',
    '<button className="text-xs font-medium text-gray-400 cursor-not-allowed flex items-center gap-1">\n                  <RefreshCw size={12} /> Regenerate\n                </button>\n              </div>\n              <textarea \n                className="w-full p-4 border border-gray-300 rounded-xl text-sm text-gray-400 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" \n                rows={5}\n                placeholder="Upload a photo and AI will generate a caption for your post..."\n                defaultValue=""\n              ></textarea>',
    content
)

with open('src/app/marketing/page.tsx', 'w') as f:
    f.write(content)
