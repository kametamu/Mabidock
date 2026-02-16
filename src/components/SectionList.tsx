import Card from './Card';

export type SectionItem = {
  title: string;
  content: string;
};

export type ContentEntry = {
  title: string;
  sections: SectionItem[];
};

type SectionListProps = {
  items: ContentEntry[];
};

function SectionList({ items }: SectionListProps) {
  return (
    <div className="card-grid">
      {items.map((item) => (
        <Card key={item.title} title={item.title}>
          <ul className="section-list">
            {item.sections.map((section) => (
              <li key={section.title}>
                <h3>{section.title}</h3>
                <p>{section.content}</p>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

export default SectionList;
