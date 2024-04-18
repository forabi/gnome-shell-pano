import type Gda5 from '@girs/gda-5.0';
import type Gda6 from '@girs/gda-6.0';
import GLib from '@girs/glib-2.0';
import { Source as MessageTraySource } from '@girs/gnome-shell/dist/ui/messageTray';
import { Notification } from '@girs/gnome-shell/dist/ui/messageTray';

// compatibility functions for Gda 5.0 and 6.0

function isGda6Builder(builder: Gda5.SqlBuilder | Gda6.SqlBuilder): builder is Gda6.SqlBuilder {
  return builder.add_expr_value.length === 1;
}

/**
 * This is hack for libgda6 <> libgda5 compatibility.
 *
 * @param value any
 * @returns expr id
 */
export function add_expr_value(builder: Gda5.SqlBuilder | Gda6.SqlBuilder, value: any): number {
  if (isGda6Builder(builder)) {
    return builder.add_expr_value(value);
  }

  return builder.add_expr_value(null, value);
}

// compatibility functions for gnome 45 / 46

function isGnome45(): boolean {
  return MessageTraySource.prototype.addNotification === undefined;
}

export function newNotification(
  source: MessageTraySource,
  text: string,
  banner: string,
  params: Notification.Params,
): Notification {
  if (isGnome45()) {
    // @ts-expect-error gnome 45 type
    return new Notification(source, text, banner, {
      datetime: GLib.DateTime.new_now_local(),
      ...params,
    });
  }

  return new Notification({
    source: source as MessageTraySource,
    title: text,
    body: banner,
    datetime: GLib.DateTime.new_now_local(),
    ...params,
  });
}

export function newMessageTraySource(title: string, iconName: string): MessageTraySource {
  if (isGnome45()) {
    // @ts-expect-error gnome 45 type
    return new MessageTraySource(title, iconName);
  }

  return new MessageTraySource({ title, iconName });
}

export function addNotification(source: MessageTraySource, notification: Notification): void {
  if (isGnome45()) {
    // @ts-expect-error gnome 45 type
    source.showNotification(notification);
  } else {
    (source as MessageTraySource).addNotification(notification as Notification);
  }
}
