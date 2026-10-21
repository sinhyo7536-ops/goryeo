import { test, eq } from './harness.js';
import * as THREE from 'three';

test('smoke: three loads r160', () => eq(THREE.REVISION, '160'));
