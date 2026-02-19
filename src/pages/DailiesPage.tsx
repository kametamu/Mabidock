import dailies from '../data/dailies.json';
import Card from '../components/Card';

type DailyType = 'daily' | 'weekly' | 'monthly';

const labelMap: Record<DailyType, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly'
};

function DailiesPage() {
  return (
    <div>
      <header className="page-header">
        <h2>日課</h2>
        <p>チェック機能なしの見やすい一覧です。</p>
      </header>

      <Card title="日課ダッシュボード">
        <ul className="daily-list">
          {dailies.map((item) => (
            <li key={item.title} className="daily-item">
              <div>
                <strong>{item.title}</strong>
                {item.note ? <p>{item.note}</p> : null}
              </div>
              <div className="tag-group">
                <span className={`type-tag ${item.type}`}>{labelMap[item.type]}</span>
                {item.cooldownDays ? (
                  <span className="cooldown-tag">{item.cooldownDays}日周期</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default DailiesPage;
