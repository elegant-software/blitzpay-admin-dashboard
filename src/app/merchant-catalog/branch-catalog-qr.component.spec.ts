import { TestBed } from '@angular/core/testing';
import { BranchCatalogQrComponent } from './branch-catalog-qr.component';

describe('BranchCatalogQrComponent', () => {
  it('renders a QR image with a clear quiet zone and clears it when the URL is removed', async () => {
    const fixture = TestBed.createComponent(BranchCatalogQrComponent);
    fixture.componentRef.setInput('url', 'https://example.test/m/merchant/b/branch');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const context = canvas.getContext('2d')!;
    context.drawImage(img, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let firstDarkColumn = canvas.width;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        if (pixels[(y * canvas.width + x) * 4] < 128) firstDarkColumn = Math.min(firstDarkColumn, x);
      }
    }
    expect(firstDarkColumn).toBeGreaterThanOrEqual(12);
    expect(firstDarkColumn).toBeLessThan(canvas.width / 2);
    fixture.componentRef.setInput('url', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
  });
});
