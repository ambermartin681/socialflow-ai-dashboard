import express from 'express';
import request from 'supertest';

jest.mock('../services/VideoService', () => ({
  videoService: {
    uploadVideo: jest.fn(),
  },
}));

jest.mock('../services/VideoQueue', () => ({
  videoQueue: {
    enqueue: jest.fn(),
  },
}));

jest.mock('../services/VideoHealthService', () => ({
  videoHealthService: {
    checkHealth: jest.fn(),
  },
}));

import { videoService } from '../services/VideoService';
import { videoQueue } from '../services/VideoQueue';
import { videoHealthService } from '../services/VideoHealthService';
import videoRouter from '../routes.video';

const mockedVideoService = videoService as jest.Mocked<typeof videoService>;
const mockedVideoQueue = videoQueue as jest.Mocked<typeof videoQueue>;
const mockedVideoHealthService = videoHealthService as jest.Mocked<typeof videoHealthService>;

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/video', videoRouter);
  return app;
}

describe('content/routes.video', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /video/upload', () => {
    it('uploads a valid video and enqueues processing', async () => {
      mockedVideoService.uploadVideo.mockResolvedValue({
        id: 'video-1',
        url: 'https://cdn.example.com/video-1.mp4',
      } as never);
      mockedVideoQueue.enqueue.mockResolvedValue({ jobId: 'job-1' } as never);

      const res = await request(buildApp())
        .post('/video/upload')
        .attach('video', Buffer.from('fake-video-bytes'), {
          filename: 'clip.mp4',
          contentType: 'video/mp4',
        });

      expect(res.status).toBeLessThan(400);
      expect(mockedVideoService.uploadVideo).toHaveBeenCalledTimes(1);
      expect(mockedVideoQueue.enqueue).toHaveBeenCalledTimes(1);
    });

    it('rejects an upload with no file attached', async () => {
      const res = await request(buildApp()).post('/video/upload');

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(mockedVideoService.uploadVideo).not.toHaveBeenCalled();
      expect(mockedVideoQueue.enqueue).not.toHaveBeenCalled();
    });

    it('rejects an invalid (non-video) file type', async () => {
      const res = await request(buildApp())
        .post('/video/upload')
        .attach('video', Buffer.from('not-a-video'), {
          filename: 'notes.txt',
          contentType: 'text/plain',
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(mockedVideoService.uploadVideo).not.toHaveBeenCalled();
      expect(mockedVideoQueue.enqueue).not.toHaveBeenCalled();
    });
  });

  describe('GET /video/health', () => {
    it('returns the video health status', async () => {
      mockedVideoHealthService.checkHealth.mockResolvedValue({
        status: 'ok',
      } as never);

      const res = await request(buildApp()).get('/video/health');

      expect(res.status).toBe(200);
      expect(mockedVideoHealthService.checkHealth).toHaveBeenCalledTimes(1);
    });
  });
});
