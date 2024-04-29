<div class="navbar bg-base-100">
    <div class="navbar-start">
        <div class="flex-none lg:hidden">
            <label for="my-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     class="inline-block w-6 h-6 stroke-current">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </label>
        </div>
        <a class="btn btn-ghost normal-case text-xl" href="/home">Console</a>
    </div>
    <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
            <li><a href="/home">Home</a></li>
            <li tabindex="-1">
                <details>
                    <summary>Parent</summary>
                    <ul class="p-2">
                        <li><a>Submenu 1</a></li>
                        <li><a>Submenu 2</a></li>
                    </ul>
                </details>
            </li>
            <li><a>Item 3</a></li>
        </ul>
    </div>
    <div class="navbar-end">
        <select class="select max-w-xs" data-choose-theme>
            <option selected disabled hidden value="">Themes</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="cupcake">Cupacke</option>
            <option value="bumblebee">Bumblebee</option>
            <option value="emerald">Emerald</option>
            <option value="corporate">Corporate</option>
            <option value="synthwave">Synthwave</option>
            <option value="retro">Retro</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="valentine">Valentine</option>
            <option value="halloween">Halloween</option>
            <option value="garden">Garden</option>
            <option value="forest">Forest</option>
            <option value="aqua">Aqua</option>
            <option value="lofi">Lofi</option>
            <option value="pastel">Pastel</option>
            <option value="fantasy">Fantasy</option>
            <option value="wireframe">Wireframe</option>
            <option value="black">Black</option>
            <option value="luxury">Luxury</option>
            <option value="dracula">Dracula</option>
            <option value="cmyk">Cmyk</option>
            <option value="autumn">Autumn</option>
            <option value="business">Business</option>
            <option value="acid">Acid</option>
            <option value="lemonade">Lemonade</option>
            <option value="night">Night</option>
            <option value="coffee">Coffee</option>
            <option value="winter">Winter</option>
        </select>
    </div>
    <div class="ml-2 flex-end">
        <a class="btn">Login</a>
    </div>
</div>

<div class="drawer lg:drawer-open">
    <input id="my-drawer" type="checkbox" class="drawer-toggle"/>
    <div class="drawer-content flex flex-col p-8">
        <slot/>
    </div>

<!--    keep an eye on height for overflow issue-->
    <div class="drawer-side h-auto">
        <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <ul class="menu p-4 w-80 min-h-full text-base-content">
            <!-- Sidebar content here -->
            <li><a>Sidebar Item 1</a></li>
            <li><a>Sidebar Item 2</a></li>
            <div class="divider"></div>
            <li><a>Sidebar Item 3</a></li>
            <li><a>Sidebar Item 4</a></li>
        </ul>
    </div>
</div>
