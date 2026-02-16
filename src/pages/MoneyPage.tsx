import money from '../data/money.json';
import SectionList from '../components/SectionList';

function MoneyPage() {
  return (
    <div>
      <header className="page-header">
        <h2>稼ぎ</h2>
        <p>金策ルートをソロ・複数PCで整理しています。</p>
      </header>
      <SectionList items={money} />
    </div>
  );
}

export default MoneyPage;
