/**
 * InsForge BaaS Integration Client for StockSense IMS
 * Connects to project 'stock sense' (f2u4f3ww.us-east.insforge.app)
 */

export const INSFORGE_CONFIG = {
  projectId: '5c2c7569-be94-4a93-97b6-5bc0970154a2',
  projectName: 'stock sense',
  appKey: 'f2u4f3ww',
  region: 'us-east',
  baseUrl: 'https://f2u4f3ww.us-east.insforge.app',
  apiKey: 'ik_10fc4d1d2419def47f5aa41035ad6699',
};

export class InsForgeService {
  private static instance: InsForgeService;
  private isOnlineStatus: boolean = true;

  private constructor() {
    this.checkConnectivity();
  }

  public static getInstance(): InsForgeService {
    if (!InsForgeService.instance) {
      InsForgeService.instance = new InsForgeService();
    }
    return InsForgeService.instance;
  }

  public async checkConnectivity(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${INSFORGE_CONFIG.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timeoutId);
      this.isOnlineStatus = !!res && res.status < 500;
      return this.isOnlineStatus;
    } catch {
      this.isOnlineStatus = false;
      return false;
    }
  }

  public getStatus() {
    return {
      connected: this.isOnlineStatus,
      project: INSFORGE_CONFIG.projectName,
      endpoint: INSFORGE_CONFIG.baseUrl,
      mode: 'Active BaaS with Local Storage Mirroring',
    };
  }
}

export const insforgeService = InsForgeService.getInstance();
