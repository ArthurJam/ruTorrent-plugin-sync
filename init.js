plugin.loadMainCSS();
plugin.loadLang(true);

function SyncHost(configuration) {
    this.id = configuration.id;
    this.name = configuration.name;
    this.protocol = configuration.protocol;
    this.host = configuration.host;
    this.port = configuration.port;
    this.path = configuration.path;
    this.secure = configuration.secure;
    this.username = configuration.username;
    this.password = configuration.password;
    this.certificate_private = configuration.certificate_private;
    this.certificate_public = configuration.certificate_public;
    this.certificate_passphrase = configuration.certificate_passphrase;
}

SyncHost.prototype.buildHtml = function (theUILang) {
    var el = $(
        '<form onsubmit="return false;">' +
        '<fieldset>' +
        '<legend>' + (this.id ? theUILang.sync.option.title.edit : theUILang.sync.option.title.new) + '</legend>' +
        '<input type="hidden" id="action" name="action" value="' + (this.id ? 'edit' : 'new') + '" />' +
        (this.id ? '<input type="hidden" id="id" name="id" value="" />' : '') +
        '<ul>' +
        '<li><label for="name">' + theUILang.sync.option.label.name + '</label><input type="text" id="name" name="name" /></li>' +
        '<li>' +
        '<label for="protocol">' + theUILang.sync.option.label.protocol + '</label>' +
        '<select id="protocol" name="protocol">' +
        '<option value="ftp">' + theUILang.sync.option.select.protocol.ftp + '</option>' +
        '<option value="ftpes">' + theUILang.sync.option.select.protocol.ftpes + '</option>' +
        '<option value="ftps">' + theUILang.sync.option.select.protocol.ftps + '</option>' +
        '<option value="sftp">' + theUILang.sync.option.select.protocol.sftp + '</option>' +
        '</select>' +
        '</li>' +
        '<li><label for="host">' + theUILang.sync.option.label.host + '</label><input type="text" id="host" name="host" /></li>' +
        '<li><label for="port">' + theUILang.sync.option.label.port + '</label><input type="text" id="port" name="port" /></li>' +
        '<li><label for="path">' + theUILang.sync.option.label.path + '</label><input type="text" id="path" name="path" /></li>' +
        '<li>' +
        '<label for="secure">' + theUILang.sync.option.label.secure + '</label>' +
        '<select id="secure" name="secure">' +
        '<option value="none">' + theUILang.sync.option.select.secure.none + '</option>' +
        '<option value="identity">' + theUILang.sync.option.select.secure.identity + '</option>' +
        '<option value="certificate">' + theUILang.sync.option.select.secure.certificate + '</option>' +
        '</select>' +
        '</li>' +
        '<li><label for="username">' + theUILang.sync.option.label.username + '</label><input type="text" id="username" name="username" /></li>' +
        '<li><label for="password">' + theUILang.sync.option.label.password + '</label><input type="password" id="password" name="password" /></li>' +
        '<li><label for="certificate_private">' + theUILang.sync.option.label.certificate.private + '</label><input type="hidden" id="certificate_private" name="certificate_private" /><input type="file" id="certificate_private_file" /></li>' +
        '<li><label for="certificate_public">' + theUILang.sync.option.label.certificate.public + '</label><input type="hidden" id="certificate_public" name="certificate_public" /><input type="file" id="certificate_public_file" /></li>' +
        '<li><label for="certificate_passphrase">' + theUILang.sync.option.label.certificate.passphrase + '</label><input type="password" id="certificate_passphrase" name="certificate_passphrase" /></li>' +
        '</ul>' +
        '</fieldset>' +
        '</form>'
    );

    var el_protocol = $('#protocol', el);
    var el_port = $('#port', el);
    var el_secure = $('#secure', el);
    var el_username = $('#username', el);
    var el_password = $('#password', el);
    var el_certificate_private = $('#certificate_private', el);
    var el_certificate_private_file = $('#certificate_private_file', el);
    var el_certificate_public = $('#certificate_public', el);
    var el_certificate_public_file = $('#certificate_public_file', el);
    var el_certificate_passphrase = $('#certificate_passphrase', el);

    el_protocol.bind('change', function (e) {
        // On vire les options incompatibles
        switch ($(this).val()) {
            case 'ftp':
            case 'ftpes':
                el_secure.children('option[value=certificate]').attr('disabled', 'disabled').siblings().removeAttr('disabled');
                el_port.val('21');
                break;
            case 'ftps':
                el_secure.children('option[value=certificate]').attr('disabled', 'disabled').siblings().removeAttr('disabled');
                el_port.val('990');
                break;
            case 'sftp':
                el_secure.children('option[value=none]').attr('disabled', 'disabled').siblings().removeAttr('disabled');
                el_port.val('22');
                break;
        }

        // On fait attention à ne pas avoir une option desactivée précédemment selectionné
        el_secure.children('option:disabled:selected').siblings(':not(:disabled):eq(0)').prop('selected', true).trigger('change');
    });

    el_secure.bind('change', function (e) {
        // On vire les options incompatibles
        switch ($(this).val()) {
            case 'none':
                el_username.parents('li').hide();
                el_password.parents('li').hide();
                el_certificate.parents('li').hide();
                el_certificate_private.parents('li').hide();
                el_certificate_public.parents('li').hide();
                el_certificate_passphrase.parents('li').hide();
                break;

            case 'identity':
                el_username.parents('li').show();
                el_password.parents('li').show();
                el_certificate_private.parents('li').hide();
                el_certificate_public.parents('li').hide();
                el_certificate_passphrase.parents('li').hide();
                break;

            case 'certificate':
                el_username.parents('li').show();
                el_password.parents('li').hide();
                el_certificate_private.parents('li').show();
                el_certificate_public.parents('li').show();
                el_certificate_passphrase.parents('li').show();
                break;
        }

        // On fait attention à ne pas avoir une option desactivée précédemment selectionné
        el_secure.children('option:disabled:selected').siblings(':not(:disabled):eq(0)').prop('selected', true).trigger('change');
    });

    el_certificate_private_file.bind('change', function (e) {
        el_certificate_private.val('');

        // @see http://www.html5rocks.com/en/tutorials/file/dndfiles/
        var file = e.target.files[0];

        // Security on File Size (Serious ?)
        if (file.size < 50000) {
            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function (the_file) {
                return function (e) {
                    el_certificate_private.val(e.target.result);
                };
            })(file);

            reader.readAsText(file);
        }
    });

    el_certificate_public_file.bind('change', function (e) {
        el_certificate_public.val('');

        // @see http://www.html5rocks.com/en/tutorials/file/dndfiles/
        var file = e.target.files[0];

        // Security on File Size (Serious ?)
        if (file.size < 50000) {
            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function (the_file) {
                return function (e) {
                    el_certificate_public.val(e.target.result);
                };
            })(file);

            reader.readAsText(file);
        }
    });

    this.apply(el);

    return el;
}

SyncHost.prototype.apply = function (el) {
    el.find('input[name=id]').val(this.id);
    el.find('input[name=name]').val(this.name);
    el.find('select[name=protocol]').val(this.protocol).trigger('change');
    el.find('input[name=host]').val(this.host);
    el.find('input[name=port]').val(this.port);
    el.find('input[name=path]').val(this.path);
    el.find('select[name=secure]').val(this.secure).trigger('change');
    el.find('input[name=username]').val(this.username);
    el.find('input[name=password]').val(this.password);
    el.find('input[name=certificate_private]').val(this.certificate_private);
    el.find('input[name=certificate_public]').val(this.certificate_public);
    el.find('input[name=certificate_passphrase]').val(this.certificate_passphrase);

    return el;
}

/**
 * Add Context Menu
 */
if (plugin.canChangeMenu()) {
    plugin.createFileMenu = theWebUI.createFileMenu;
    plugin.createMenu = theWebUI.createMenu;

    /**
     * Context Menu on Torrent
     */
    theWebUI.createMenu = function (e, id) {
        plugin.createMenu.call(this, e, id);

        if (plugin.enabled && plugin.allStuffLoaded) {
            var table = this.getTable("trt");

            if (table.selCount > 0) {
                var thash_selected = [];

                for (var thash in table.rowSel) {
                    if (table.rowSel[thash] && thash.length == 40) {
                        thash_selected.push(thash);
                    }
                }

                theContextMenu.add([
                    CMENU_CHILD,
                    theUILang.sync.option.title.page,
                    plugin.getHostListMenu(thash_selected, null)
                ]);
            }
        }

        return true;
    };

    /**
     * Context Menu on File
     */
    theWebUI.createFileMenu = function (e, id) {
        if (plugin.createFileMenu.call(this, e, id)) {
            if (plugin.enabled && plugin.allStuffLoaded) {
                var thash = theWebUI.dID;
                var table = this.getTable("fls");

                if (table.selCount > 0 && thash.length == 40) {
                    var fid_selected = [];

                    for (var fid in table.rowSel) {
                        if (table.rowSel[fid]) {
                            fid_selected.push(fid);
                        }
                    }

                    theContextMenu.add([
                        CMENU_CHILD,
                        theUILang.sync.option.title.page,
                        plugin.getHostListMenu([thash], fid_selected)
                    ]);
                }
            }

            return true;
        }

        return false;
    };

    /**
     * Add Sync Task on File or Torrent
     * Dont use rTorrentStub to Configure XHR
     *
     * @param host_id      Host
     * @param torrent_hash Torrent Hash
     * @param file_id      File Number
     */
    theWebUI.fileSync = function (host_id, torrent_hash, file_id) {
        $.ajax({
            method: 'POST',
            url: 'plugins/sync/action.php',
            data: {
                cmd: 'addTask',
                host_id: host_id,
                torrent_hash: torrent_hash,
                file_id: file_id
            },
            dataType: 'script',
            error: function(jqXHR, textStatus, errorThrown) {
                theWebUI.error(textStatus, errorThrown);
            },
            success: function() {
                theTabs.show('tasks');
            }
        });
    };
}

if (plugin.canChangeOptions()) {
    plugin.addAndShowSettings = theWebUI.addAndShowSettings;
    plugin.setSettings = theWebUI.setSettings;

    /**
     * Add Option Page
     */
    theWebUI.addAndShowSettings = function (arg) {
        if (plugin.enabled) {
            var el = $('#st_sync #host_list');

            if (plugin.syncHostList.length == 0) {
                el.attr('disabled', 'disabled').html('<option value="0">Aucune configuration</option>');
            } else {
                el.removeAttr('disabled').empty();

                $.each(plugin.syncHostList, function (id, configuration) {
                    el.append($('<option value="' + id + '">' + configuration.name + '</option>').data('configuration', configuration));
                });
            }
        }

        plugin.addAndShowSettings.call(theWebUI, arg);
    };

    /**
     * Save Options and Callback UI
     */
    theWebUI.setSettings = function () {
        plugin.setSettings.call(this);

        if (plugin.enabled && plugin.isOptionChanged()) {
            this.request('?action=SyncHost', [plugin.setHostList, plugin]);
        }
    };

    /**
     * Change on Option ?
     */
    plugin.isOptionChanged = function () {
        return true;
    };

    /**
     * Set Options in UI
     */
    plugin.setHostList = function (host_list) {
        plugin.syncHostList = host_list;
    };

    /**
     * Build Menu on File or Torrent
     *
     * @param torrent_hash Torrent Hash
     * @param file_id      File Number
     *
     * @returns {Array}
     */
    plugin.getHostListMenu = function (torrent_hash, file_id) {
        var submenu = [];

        if (plugin.syncHostList.length == 0) {
            submenu.push(['Aucune configuration']);
        } else {
            $.each(plugin.syncHostList, function (host_id, configuration) {
                submenu.push([
                    configuration.name,
                    function () { theWebUI.fileSync(host_id, torrent_hash, file_id); }
                ]);
            });
        }

        return submenu;
    };

    /**
     * Configure XHR to Save Options
     */
    rTorrentStub.prototype.SyncHost = function () {
        var form = $('#st_sync form');

        this.content = 'cmd=option&' + form.serialize();
        this.contentType = "application/x-www-form-urlencoded";
        this.mountPoint = 'plugins/sync/action.php';
        this.dataType = 'json';

        form.empty();
    }
}

/**
 * Initialization
 * Trigger Load
 */
plugin.onLangLoaded = function () {
    if (this.canChangeOptions()) {
        var container = $(
            '<div id="st_sync">' +
            '<fieldset>' +
            '<legend>' + theUILang.sync.option.title.section_host + '</legend>' +
            '<input type="button" class="Button" value="' + theUILang.sync.option.button.new + '" id="host_new" />' +
            '<select id="host_list" name="host_list" disabled="disabled"></select><input type="button" class="Button" value="' + theUILang.sync.option.button.edit + '" id="host_edit" /><input type="button" class="Button" value="' + theUILang.sync.option.button.delete + '" id="host_delete" />' +
            '</fieldset>' +
            '<form onsubmit="return false;"></form>' +
            '</div>'
        );

        $('#host_new', container).bind('click', function (e) {
            e.preventDefault();

            var host = new SyncHost({
                "id": null,
                "name": null,
                "protocol": 'ftp',
                "host": null,
                "port": 21,
                "path": '/',
                "secure": 'identity',
                "username": null,
                "password": null,
                "certificate": null
            });

            $('form', container).replaceWith(host.buildHtml(theUILang));
        });

        $('#host_edit', container).bind('click', function (e) {
            e.preventDefault();

            var option_selected = $('#host_list').find('option:selected');

            if (option_selected.length == 1 && option_selected.data('configuration')) {
                var host = new SyncHost(option_selected.data('configuration'));

                $('form', container).replaceWith(host.buildHtml(theUILang));
            } else {
                $('form', container).empty();
            }
        });

        $('#host_delete', container).bind('click', function (e) {
            e.preventDefault();

            var option_selected = $('#host_list').find('option:selected');

            if (option_selected.length == 1 && option_selected.data('configuration')) {
                var host_configuration = option_selected.data('configuration');

                $('form', container).html(
                    '<fieldset>' +
                    '<legend>' + theUILang.sync.option.title.delete + '</legend>' +
                    '<input type="hidden" id="action" name="action" value="delete" />' +
                    '<input type="hidden" id="id" name="id" value="' + host_configuration.id + '" />' +
                    '<p>' + theUILang.sync.option.message.delete.replace('%name%', host_configuration.name) + '</p>' +
                    '</fieldset>'
                );
            } else {
                $('form', container).empty();
            }
        });

        this.attachPageToOptions(
            container[0],
            theUILang.sync.option.title.page
        );
    }

    plugin.markLoaded();
};

/**
 * Unload Plugin
 */
plugin.onRemove = function () {
    this.removePageFromOptions('st_sync');
};