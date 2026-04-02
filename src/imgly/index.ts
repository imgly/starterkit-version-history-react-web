/**
 * CE.SDK Version History - Initialization Module
 *
 * This module provides the main entry point for initializing the version history editor.
 * It configures CE.SDK with snapshot functionality, allowing users to save and load
 * previous versions of their designs.
 *
 * @see https://img.ly/docs/cesdk/js/getting-started/
 */

import CreativeEditorSDK from '@cesdk/cesdk-js';

import {
  BlurAssetSource,
  ColorPaletteAssetSource,
  CropPresetsAssetSource,
  DemoAssetSources,
  EffectsAssetSource,
  FiltersAssetSource,
  PagePresetsAssetSource,
  StickerAssetSource,
  TextAssetSource,
  TextComponentAssetSource,
  TypefaceAssetSource,
  UploadAssetSources,
  VectorShapeAssetSource
} from '@cesdk/cesdk-js/plugins';

import { DesignEditorConfig } from './config/plugin';
import { getInitialSceneUrl } from './snapshots';
import { Snapshot } from '../app/types';

// Re-export plugin for external use
export { DesignEditorConfig } from './config/plugin';

// Export snapshot creation function for use in App.tsx
export { createSnapshot } from './history';

// Export initial snapshots data
export { INITIAL_SNAPSHOTS, getInitialSceneUrl } from './snapshots';

/**
 * Callback type for when a snapshot is saved.
 * Receives the scene string from the editor.
 */
export type OnSave = (sceneString: string) => void | Promise<void>;

// ============================================================================
// Main Initialization
// ============================================================================

/**
 * Initialize a CE.SDK instance with version history configuration.
 *
 * This function configures an already-created CE.SDK instance with:
 * - Design editor UI configuration
 * - Save action that calls the onSave callback
 * - Navigation bar with save button
 * - Asset source plugins
 * - i18n translations for "Save Snapshot" button
 *
 * @param cesdk - The CreativeEditorSDK instance to configure
 * @param onSave - Callback invoked when the user saves (receives scene string)
 */
export async function initVersionHistoryEditor(
  cesdk: CreativeEditorSDK,
  onSave: OnSave
): Promise<void> {
  // ============================================================================
  // Configuration Plugin
  // ============================================================================

  // Add the version history editor configuration plugin
  await cesdk.addPlugin(new DesignEditorConfig());

  // ============================================================================
  // Save Action
  // ============================================================================

  // Register the saveScene action that calls the onSave callback
  // This allows the app to handle snapshot creation
  cesdk.actions.register('saveScene', async () => {
    const sceneString = await cesdk.engine.scene.saveToString();
    await onSave(sceneString);
  });

  // ============================================================================
  // Navigation Bar Actions
  // ============================================================================

  // Add the save button to the navigation bar
  cesdk.ui.insertOrderComponent(
    { in: 'ly.img.navigation.bar', position: 'end' },
    {
      id: 'ly.img.actions.navigationBar',
      children: ['ly.img.saveScene.navigationBar']
    }
  );

  // ============================================================================
  // Asset Source Plugins
  // ============================================================================

  // Color palettes for design
  await cesdk.addPlugin(new ColorPaletteAssetSource());

  // Typeface/font assets
  await cesdk.addPlugin(new TypefaceAssetSource());

  // Text presets
  await cesdk.addPlugin(new TextAssetSource());

  // Text components
  await cesdk.addPlugin(new TextComponentAssetSource());

  // Vector shapes
  await cesdk.addPlugin(new VectorShapeAssetSource());

  // Sticker assets
  await cesdk.addPlugin(new StickerAssetSource());

  // Visual effects
  await cesdk.addPlugin(new EffectsAssetSource());

  // Photo filters
  await cesdk.addPlugin(new FiltersAssetSource());

  // Blur presets
  await cesdk.addPlugin(new BlurAssetSource());

  // Page format presets
  await cesdk.addPlugin(new PagePresetsAssetSource());

  // Crop presets
  await cesdk.addPlugin(new CropPresetsAssetSource());

  // Local upload sources
  await cesdk.addPlugin(
    new UploadAssetSources({
      include: ['ly.img.image.upload']
    })
  );

  // Demo assets
  await cesdk.addPlugin(
    new DemoAssetSources({
      include: ['ly.img.image.*']
    })
  );

  // ============================================================================
  // i18n Translation
  // ============================================================================

  // Change "Save" button text to "Save Snapshot"
  cesdk.i18n.setTranslations({
    en: {
      'common.save': 'Save Snapshot'
    }
  });

  // ============================================================================
  // Dock Order Configuration
  // ============================================================================

  // Remove template from dock order (not needed for version history)
  cesdk.ui.setDockOrder([
    ...cesdk.ui.getDockOrder().filter(({ key }) => key !== 'ly.img.template')
  ]);

  // ============================================================================
  // Scene Loading
  // ============================================================================

  // Load the first snapshot as the initial scene
  await cesdk.loadFromURL(getInitialSceneUrl());
}

// ============================================================================
// Snapshot Loading
// ============================================================================

/**
 * Load a snapshot into the editor
 *
 * @param cesdk - The CreativeEditorSDK instance
 * @param snapshot - The snapshot to load
 */
export async function loadSnapshot(
  cesdk: CreativeEditorSDK,
  snapshot: Snapshot
): Promise<void> {
  await cesdk.loadFromURL(snapshot.sceneUrl);
  const page = cesdk.engine.scene.getPages()[0];
  if (page) {
    cesdk.engine.scene.enableZoomAutoFit(page, 'Both', 20.0, 20.0, 20.0, 20.0);
  }
}
