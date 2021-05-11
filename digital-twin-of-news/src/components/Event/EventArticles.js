import React, { useState } from 'react';

function EventArticles({ articles }) {
  const [articlesCollapsed, setArticlesCollapsed] = useState(articles.length > 3);

  function renderArticle(article, key) {
    return (
      <div className="article-info" key={key}>
        <a
          className="article-title"
          href={article.url}
          rel="noreferrer noopener"
          target="_blank"
          title={article.title.trim()}
        >
          {article.title}
        </a>
        {article.source && article.source.length > 0 && (
          <span className="article-source">{article.source}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`articles ${articles.length === 0 ? 'hidden' : ''}`}>
      <div className="line-break articles-start" />
      <div className="articles-header">Connected articles:</div>

      <div className={`articles-list ${articlesCollapsed ? 'collapsed' : ''}`}>
        {!articlesCollapsed && articles.map((article, i) => renderArticle(article, i))}
        {articlesCollapsed && articles.slice(0, 3).map((article, i) => renderArticle(article, i))}
      </div>

      <div
        className={`articles-show-all ${articles.length <= 3 ? 'hidden' : ''}`}
        onClick={() => setArticlesCollapsed(!articlesCollapsed)}
      >
        {articlesCollapsed ? 'Show all' : 'Show less'}
      </div>
      <div className="line-break articles-end" />
    </div>
  );
}

export default EventArticles;
