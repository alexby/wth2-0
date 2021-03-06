/* Use this script if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'Webdoc-Icons\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon_layout_2_vertical' : '&#x21;',
			'icon_zoom_out' : '&#x22;',
			'icon_zoom_in' : '&#x23;',
			'icon_youtube' : '&#x24;',
			'icon_who_to_follow' : '&#x25;',
			'icon_wand' : '&#x26;',
			'icon_volume_3' : '&#x27;',
			'icon_volume_2' : '&#x28;',
			'icon_volume_1' : '&#x29;',
			'icon_volume_0' : '&#x2a;',
			'icon_vimeo' : '&#x2b;',
			'icon_video' : '&#x2c;',
			'icon_video_alt' : '&#x2d;',
			'icon_user' : '&#x2e;',
			'icon_url' : '&#x2f;',
			'icon_unrepost' : '&#x30;',
			'icon_unlock' : '&#x31;',
			'icon_unlisted' : '&#x32;',
			'icon_underline' : '&#x33;',
			'icon_twitter' : '&#x34;',
			'icon_trash' : '&#x35;',
			'icon_tools' : '&#x36;',
			'icon_the_orchard' : '&#x37;',
			'icon_text' : '&#x38;',
			'icon_table' : '&#x39;',
			'icon_switch' : '&#x3a;',
			'icon_stop' : '&#x3b;',
			'icon_star' : '&#x3c;',
			'icon_star_empty' : '&#x3d;',
			'icon_soundcloud' : '&#x3e;',
			'icon_soundcloud_play' : '&#x3f;',
			'icon_sound' : '&#x40;',
			'icon_sidebar' : '&#x41;',
			'icon_shuffle' : '&#x42;',
			'icon_shopping_cart' : '&#x43;',
			'icon_share' : '&#x44;',
			'icon_settings' : '&#x45;',
			'icon_search' : '&#x46;',
			'icon_save_as_draft' : '&#x47;',
			'icon_rotate' : '&#x48;',
			'icon_repost' : '&#x49;',
			'icon_reply' : '&#x4a;',
			'icon_repeat' : '&#x4b;',
			'icon_refresh' : '&#x4c;',
			'icon_record' : '&#x4d;',
			'icon_radio_full' : '&#x4e;',
			'icon_radio_empty' : '&#x4f;',
			'icon_quote' : '&#x50;',
			'icon_quote_open' : '&#x51;',
			'icon_quote_close' : '&#x52;',
			'icon_previous' : '&#x53;',
			'icon_point_up' : '&#x54;',
			'icon_point_right' : '&#x55;',
			'icon_point_left' : '&#x56;',
			'icon_point_down' : '&#x57;',
			'icon_playlist_video' : '&#x58;',
			'icon_playlist_sound' : '&#x59;',
			'icon_play' : '&#x5a;',
			'icon_play_alt2' : '&#x5b;',
			'icon_play_alt' : '&#x5c;',
			'icon_pin_vertical' : '&#x5d;',
			'icon_pin_up' : '&#x5e;',
			'icon_pin_right' : '&#x5f;',
			'icon_pin_left' : '&#x60;',
			'icon_pin_horizontal' : '&#x61;',
			'icon_pin_down' : '&#x62;',
			'icon_picture' : '&#x63;',
			'icon_picture_alt' : '&#x64;',
			'icon_pen' : '&#x65;',
			'icon_pen_size' : '&#x66;',
			'icon_pause' : '&#x67;',
			'icon_numbers' : '&#x68;',
			'icon_next' : '&#x69;',
			'icon_move' : '&#x6a;',
			'icon_microphone' : '&#x6b;',
			'icon_medal' : '&#x6c;',
			'icon_mail' : '&#x6d;',
			'icon_logo' : '&#x6e;',
			'icon_lock' : '&#x6f;',
			'icon_location' : '&#x70;',
			'icon_load' : '&#x71;',
			'icon_link' : '&#x72;',
			'icon_light_up' : '&#x73;',
			'icon_light_down' : '&#x74;',
			'icon_layout' : '&#x75;',
			'icon_layout_3_top' : '&#x76;',
			'icon_layout_3_right' : '&#x77;',
			'icon_layout_3_left' : '&#x78;',
			'icon_layout_3_bottom' : '&#x79;',
			'icon_layout_2_horizontal' : '&#x7a;',
			'icon_italic' : '&#x7b;',
			'icon_info' : '&#x7c;',
			'icon_infinity' : '&#x7d;',
			'icon_html' : '&#xe000;',
			'icon_home' : '&#xe001;',
			'icon_highlight' : '&#xe002;',
			'icon_highlight_add' : '&#xe003;',
			'icon_help' : '&#xe004;',
			'icon_heart' : '&#xe005;',
			'icon_heart_break' : '&#xe006;',
			'icon_globe' : '&#xe007;',
			'icon_fullscreen' : '&#xe008;',
			'icon_fullscreen_exit' : '&#xe009;',
			'icon_fullscreen_alt2' : '&#xe00a;',
			'icon_fullscreen_alt' : '&#xe00b;',
			'icon_frame' : '&#xe00c;',
			'icon_fontself' : '&#xe00d;',
			'icon_flag' : '&#xe00e;',
			'icon_filters' : '&#xe00f;',
			'icon_filters_alt' : '&#xe010;',
			'icon_facebook' : '&#xe011;',
			'icon_eye' : '&#xe012;',
			'icon_eraser' : '&#xe013;',
			'icon_embed' : '&#xe014;',
			'icon_delete' : '&#xe015;',
			'icon_cursor' : '&#xe016;',
			'icon_colorpicker' : '&#xe017;',
			'icon_cloud' : '&#xe018;',
			'icon_cloud_upload' : '&#xe019;',
			'icon_close' : '&#xe01a;',
			'icon_clock' : '&#xe01b;',
			'icon_checkbox_full' : '&#xe01c;',
			'icon_checkbox_empty' : '&#xe01d;',
			'icon_check' : '&#xe01e;',
			'icon_chat' : '&#xe01f;',
			'icon_category' : '&#xe020;',
			'icon_category_alt' : '&#xe021;',
			'icon_camera' : '&#xe022;',
			'icon_camera_switch' : '&#xe023;',
			'icon_calendar' : '&#xe024;',
			'icon_bullet' : '&#xe025;',
			'icon_bucket' : '&#xe026;',
			'icon_bubble' : '&#xe027;',
			'icon_bubble_alt2' : '&#xe028;',
			'icon_bubble_alt' : '&#xe029;',
			'icon_bold' : '&#xe02a;',
			'icon_block' : '&#xe02b;',
			'icon_arrow_up' : '&#xe02c;',
			'icon_arrow_right' : '&#xe02d;',
			'icon_arrow_left' : '&#xe02e;',
			'icon_arrow_down' : '&#xe02f;',
			'icon_ambassador' : '&#xe030;',
			'icon_align_right' : '&#xe031;',
			'icon_align_left' : '&#xe032;',
			'icon_align_justify' : '&#xe033;',
			'icon_align_center' : '&#xe034;',
			'icon_alert' : '&#xe035;',
			'icon_add' : '&#xe036;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; i < els.length; i += 1) {
		el = els[i];
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon_[^\s'"]+/);
		if (c) {
			addIcon(el, icons[c[0]]);
		}
	}
};