import type { PropsWithChildren } from 'react';

type CardProps = PropsWithChildren<{
  title: string;
}>;

function Card({ title, children }: CardProps) {
  return (
    <section className="card">
      <h2 className="card-title">{title}</h2>
      <div className="card-body">{children}</div>
    </section>
  );
}

export default Card;
