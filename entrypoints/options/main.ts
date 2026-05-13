import { mount } from 'svelte';
import App from './App.svelte';
import '../../src/ui/app.css';

mount(App, { target: document.getElementById('app')! });
