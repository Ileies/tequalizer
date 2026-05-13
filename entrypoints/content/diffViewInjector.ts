import { mount, unmount } from 'svelte';
import DiffView from '../../src/ui/components/DiffView.svelte';

export interface DiffViewOptions {
  original: string;
  rewritten: string;
  onAccept: () => void;
  onDiscard: () => void;
  onChangeStyle: () => void;
  onSave: () => void;
}

export function showDiffView(options: DiffViewOptions): () => void {
  const host = document.createElement('div');
  host.setAttribute('data-rewrite-diff-host', 'true');
  document.body.appendChild(host);

  const component = mount(DiffView, { target: host, props: options });

  return () => {
    unmount(component);
    host.remove();
  };
}
