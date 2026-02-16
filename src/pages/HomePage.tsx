import links from '../data/links.json';
import Card from '../components/Card';

function HomePage() {
  return (
    <div>
      <header className="page-header">
        <h2>便利リンク</h2>
        <p>よく使うマビノギ情報サイトをまとめています。</p>
      </header>

      <div className="card-grid">
        {links.map((link) => (
          <Card key={link.url} title={link.title}>
            <p>{link.description}</p>
            <a
              className="external-link"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              サイトを開く
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
