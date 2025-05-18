import { component$, Resource } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

interface Article {
  title: string;
  content: string;
  author_name: string;
  author_email: string;
  author_link: string;
  image_url: string;
  created_at: string;
}

export const useArticle = routeLoader$(async ({ params, redirect }) => {
  try {
    const url = `http://api:3000/api/article/${params.url}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.statusText}`);
    }
    const article: Article = await response.json();

    const html = DOMPurify.sanitize(
      await marked.parse(
        article.content.replace(
          /^(?:\u200B|\u200C|\u200D|\u200E|\u200F|\uFEFF)+/,
          "",
        ),
      ),
    );

    article.content = html;

    return article;
  } catch (e) {
    throw redirect(300, "/");
  }
});

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 600,
    maxAge: 5,
  });
};

export default component$(() => {
  const articleResource = useArticle();

  return (
    <main class="flex justify-center p-8">
      <Resource
        value={articleResource}
        onResolved={(article) => {
          return (
            <div class="flex max-w-3xl flex-col gap-2">
              <img
                src={article.image_url}
                alt={article.title}
                width={800}
                height={400}
                class="h-auto max-w-3xl"
              />
              <h1 class="text-xl font-semibold lg:text-2xl">{article.title}</h1>
              <div class="flex flex-row justify-between">
                <div class="flex min-w-max flex-row justify-between">
                  <a
                    class="text-sm font-normal hover:cursor-pointer hover:text-purple-500 md:text-base"
                    href={article.author_link}
                  >
                    <h2 class="text-sm font-normal md:text-base">
                      {article.author_name}
                    </h2>
                  </a>
                  <a
                    class="text-sm font-normal hover:cursor-pointer hover:text-purple-500 md:text-base"
                    href={`mailto:${article.author_email}`}
                  >
                    {article.author_email}
                  </a>
                </div>
              </div>
              <div dangerouslySetInnerHTML={article.content} />
              <div class="flex flex-row justify-between">
                <span class="text-sm font-light md:text-base">
                  {new Date(Date.parse(article.created_at)).toLocaleString()}
                </span>
              </div>
            </div>
          );
        }}
      />
    </main>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const article = resolveValue(useArticle);
  return {
    title: `${article.title} | Insomnia Blog`,
  };
};
