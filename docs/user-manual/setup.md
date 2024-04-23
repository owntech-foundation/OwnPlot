
{%set base_url =  "https://github.com/owntech-foundation/OwnPlot/releases/download/release-" + ownplot.version  + "/" %}
{%set win_exe = "OwnPlot.Setup." + ownplot.version + ".exe" %}
{%set mac_exe = "OwnPlot-" + ownplot.version + "-universal.dmg" %}
{%set deb_exe = "OwnPlot-" + ownplot.version + "_amd64.deb" %}
{%set rpm_exe = "OwnPlot-" + ownplot.version + ".x86_64.rpm" %}
{%set appi_exe = "OwnPlot-" + ownplot.version + ".AppImage" %}

{%set win_url = base_url + win_exe %}
{%set mac_url = base_url + mac_exe %}
{%set deb_url = base_url + deb_exe %}
{%set rpm_url = base_url + rpm_exe %}
{%set appi_url = base_url + appi_exe %}
{%set page_base = config.site_url + "/OwnPlot/docs/user-manual/" %}

## Installing OwnPlot

Choose your system and follow the installation procedure.

### Step 1 - Download OwnPlot
!!! info "Releases"
	All OwnPlot releases can be downloaded on [github](https://github.com/owntech-foundation/OwnPlot/releases).

=== ":fontawesome-brands-windows: Windows"

	Download the file [{{ win_exe }}]({{ win_url }})

=== ":fontawesome-brands-apple: macOS"
	This works with Intel & Apple silicon

	Download the file [{{ mac_exe }}]({{ mac_url }})

=== ":fontawesome-brands-linux::fontawesome-brands-debian: Linux (Debian based)"

	Download the file [{{ deb_exe }}]({{ deb_url }})


=== ":fontawesome-brands-linux::fontawesome-brands-redhat: Linux (RedHat based)"

	Download the file [{{ rpm_exe }}]({{ rpm_url }})


=== ":fontawesome-brands-linux: Linux (AppImage)"

	Download the file [{{ appi_exe }}]({{ appi_url }})


### Step 2 - Install OwnPlot

=== ":fontawesome-brands-windows: Windows"

	1. Launch the executable *{{ win_exe }}*
	2. The app will automatically install in the `User\AppData\Local\Programs\OwnPlot` folder

=== ":fontawesome-brands-apple: macOS"
	!!! success "Compatibility"
		This works with Intel & Apple silicon
	
	1. Launch the disk image *{{ mac_exe }}*
	2. Drag and drop OwnPlot into your Applications folder 
	![mac install]({{ page_base }}imgs/OwnPlot_macOS_install.png)

=== ":fontawesome-brands-linux::fontawesome-brands-debian: Linux (Debian based)"
	1. Open a terminal
	2. Install the package
	``` shell
	sudo dpkg -i {{ deb_exe }}
	```

=== ":fontawesome-brands-linux::fontawesome-brands-redhat: Linux (RedHat based)"
	!!! warning
		This install has not been tested yet

	1. Open a terminal
	2. Install the package
	``` shell
	sudo rpm -i {{ rpm_exe }}
	```

=== ":fontawesome-brands-linux: Linux (AppImage)"

	1. Right-click on the AppImage file
    2. Check the button to allow it to run as a program

### Step 3 - Run OwnPlot

=== ":fontawesome-brands-windows: Windows"

	1. OwnPlot should launch itself right after the installation has been completed.
	2. OwnPlot should be available from the start menu

=== ":fontawesome-brands-apple: macOS"

    Launch OwnPlot from your Application folder or the LaunchPad

	!!! note "If you have trouble running the app for the first time"
		1. If you get this:

		![Mac cannot run]({{ page_base }}imgs/OwnPlot_macOS_cant_run.png){ width="300" }

		2. Open System Preferences
		3. Go to *Security & Privacy* Tab
		4. Allow OwnPlot to run by clicking the button "Allow"
		![mac Allow app]({{ page_base }}imgs/OwnPlot_macOS_open_anyways.png)

=== ":fontawesome-brands-linux::fontawesome-brands-debian: Linux (Debian based)"

    Type `ownplot` on the terminal.

=== ":fontawesome-brands-linux::fontawesome-brands-redhat: Linux (RedHat based)"

    Type `ownplot` on the terminal.

=== ":fontawesome-brands-linux: Linux (AppImage)"

    Double-click on the AppImage file


!!! warning "Performances issues"

	As of today, The last version available is [v0.6.0](https://github.com/owntech-foundation/OwnPlot/releases/tag/release-0.6.0).

	However, **v0.6.0** has been reported to have a low performance. If you have trouble running this release, fall back on version [v0.5.1](https://github.com/owntech-foundation/OwnPlot/releases/tag/release-0.5.1)

{% if page.url == "OwnPlot/docs/user-manual/setup/" %}
Great! Now that you have OwnPlot installed and all setup, we can proceed to your [first steps](first-steps.md) with OwnPlot.
{% endif %}