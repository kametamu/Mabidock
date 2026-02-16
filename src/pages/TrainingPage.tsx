import training from '../data/training.json';
import SectionList from '../components/SectionList';

function TrainingPage() {
  return (
    <div>
      <header className="page-header">
        <h2>育成</h2>
        <p>キャラ育成に関するメモをカテゴリ単位で管理します。</p>
      </header>
      <SectionList items={training} />
    </div>
  );
}

export default TrainingPage;
