import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { LuHome, LuUpload } from "@qwikest/icons/lucide";

export default component$(() => {
  return (
    <>
      <nav
        id="navbar"
        class="flex flex-row justify-between border-b-2 border-black p-8"
      >
        <Link href="/">
          <h1 class="text-3xl font-bold transition-transform ease-in-out hover:scale-105 hover:cursor-pointer hover:text-purple-500">
            <LuHome />
          </h1>
        </Link>
        <Link href="/article/upload">
          <h1 class="text-3xl font-bold transition-transform ease-in-out hover:scale-105 hover:cursor-pointer hover:text-purple-500">
            <LuUpload />
          </h1>
        </Link>
      </nav>
    </>
  );
});
