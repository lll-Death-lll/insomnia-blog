import { $, component$, useStore } from "@builder.io/qwik";
import { server$, useNavigate, type DocumentHead } from "@builder.io/qwik-city";

interface UploadForm {
  title: string;
  content: string;
  article_url: string;
  image_url: string;
  username: string;
  password: string;
}

export default component$(() => {
  const nav = useNavigate();

  const formData = useStore<UploadForm>({
    title: "",
    content: "",
    article_url: "",
    image_url: "",
    username: "",
    password: "",
  });

  const handleSubmit = $(async () => {
    const validateForm = () => {
      if (!formData.title) {
        alert("Title is required");
        return false;
      }
      if (!formData.content) {
        alert("Content is required");
        return false;
      }
      if (!formData.article_url) {
        alert("Invalid article URL");
        return false;
      }
      if (!formData.image_url || !isValidUrl(formData.image_url)) {
        alert("Invalid image URL");
        return false;
      }
      if (!formData.username) {
        alert("Username is required");
        return false;
      }
      if (!formData.password) {
        alert("Password is required");
        return false;
      }
      return true;
    };

    const isValidUrl = (urlString: string) => {
      try {
        new URL(urlString);
        return true;
      } catch (_) {
        return false;
      }
    };

    if (!validateForm()) {
      return;
    }

    try {
      const articleUrl = await uploadArticle(formData);
      console.log(`Added article with url: ${articleUrl}`);
      const url = `/article/${articleUrl}`;
      nav(url);
    } catch (e) {
      console.log(e);
    }
  });

  return (
    <div class="flex justify-center">
      <form
        preventdefault:submit
        onSubmit$={handleSubmit}
        class="w-full max-w-xl space-y-4 rounded-xl bg-gray-800 p-6"
      >
        <div class="flex flex-col">
          <label for="title" class="mb-1 text-lg">
            Title:
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onInput$={(e) => {
              formData.title = (e.target as HTMLInputElement).value;
            }}
            required
            class="rounded bg-gray-700 p-2 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div class="flex flex-row items-center gap-4">
          <label for="content" class="mb-1 text-lg">
            Content (.md):
          </label>
          <input
            id="content"
            type="file"
            accept=".md"
            onChange$={async (e: any) => {
              const file = e.target.files?.[0];
              if (file) {
                try {
                  formData.content = await file.text();
                } catch (err) {
                  console.error("Error reading file:", err);
                }
              }
            }}
            required
            class="block"
          />
        </div>

        <div class="flex flex-col">
          <label for="article_url" class="mb-1 text-lg">
            Article URL:
          </label>
          <input
            id="article_url"
            type="text"
            value={formData.article_url}
            onInput$={(e) => {
              formData.article_url = (e.target as HTMLInputElement).value;
            }}
            required
            class="rounded bg-gray-700 p-2 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div class="flex flex-col">
          <label for="image_url" class="mb-1 text-lg">
            Image URL:
          </label>
          <input
            id="image_url"
            type="url"
            value={formData.image_url}
            onInput$={(e) => {
              formData.image_url = (e.target as HTMLInputElement).value;
            }}
            required
            class="rounded bg-gray-700 p-2 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div class="flex flex-col">
          <label for="username" class="mb-1 text-lg">
            Username:
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onInput$={(e) => {
              formData.username = (e.target as HTMLInputElement).value;
            }}
            required
            class="rounded bg-gray-700 p-2 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div class="flex flex-col">
          <label for="password" class="mb-1 text-lg">
            Password:
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onInput$={(e) => {
              formData.password = (e.target as HTMLInputElement).value;
            }}
            required
            class="rounded bg-gray-700 p-2 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div class="flex justify-center">
          <button
            type="submit"
            class="rounded-xl bg-purple-500 px-6 py-2 text-2xl text-white transition-transform duration-200 hover:scale-105 hover:border hover:border-purple-500 hover:bg-transparent hover:text-purple-500"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
});

export const uploadArticle = server$(async function (
  data: UploadForm,
): Promise<string> {
  const response = await fetch("http://api:3000/api/article", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const url: string = await response.text();

  return url;
});

export const head: DocumentHead = {
  title: "Upload | Insomnia Blog",
};
