OwnPlot
=======

What is OwnPlot
===============

**OwnPlot** is a free and opensource software designed to work with OwnTech's dev board.

However, everybody can use this software as a dataplotter with any devboard.

OwnPlot is written in Electron. This technology uses Javascript and Chromium and is plateform agnostic.
This technology has been choosen to ensure maximum compatibility and rapid development cycle.

How to use it
=============



Running the development environment
===================================

First of all, open the terminal of your choice.
If you are using Windows, we recommand the use of git bash https://www.git-scm.com/downloads

1. type: \
    `node --version`
    * If the command prompt tells you node isn't present on your computer, then download and install nodejs thru this website:
        https://nodejs.org/en/download/
    * If the version is inferior than version 14.x.x then you'll need to update nodejs. `nvm` is a great little piece of kit that will make your life a lot easier   https://github.com/nvm-sh/nvm
2. Clone the repository:
    * If you have a gitlab accound and a ssh key linked to this one, clone with this command instead: \
    `git clone git@gitlab.laas.fr:garthaud/ownplot.git`

    * Otherwise use this command: \
    `git clone https://gitlab.laas.fr/garthaud/ownplot.git`

3. Go the the newly created folder: \
`cd ownplot`

4. Install the decencies: \
`npm install`

5. Run the development environment: \
`npm start`

**Congrats!** 🥳 \
A window should be opened with OwnPlot.

If you are experiencing problems during the install, please post an issue and report the problem. This will greatly help us improve the user experience.

Build for your plateform
========================

Simply run `npm run make` \
The `.exe` / `.app` / `.deb` / `.rpm` file can be found in the `out` folder.
