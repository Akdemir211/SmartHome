const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://alex.petratech.io';

export function buildWelcomeEmail(name: string): { subject: string; html: string } {
  const subject =
    'Geleceğin Evine Adım Attınız: Alex Erken Erişiminiz Onaylandı! 🚀';

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#f0f0f5;padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

          <!-- Header — mor bant -->
          <tr>
            <td style="background:linear-gradient(135deg,#5b21b6 0%,#7c3aed 50%,#8b5cf6 100%);padding:36px 40px 32px;text-align:center;">

              <!-- Logo badge -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:20px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:10px;padding:10px 22px;">
                    <span style="font-size:20px;font-weight:800;letter-spacing:4px;color:#ffffff;text-transform:uppercase;">ALEX</span>
                    <span style="font-size:10px;color:rgba(255,255,255,0.6);letter-spacing:2px;margin-left:8px;vertical-align:middle;text-transform:uppercase;">Smart Home</span>
                  </td>
                </tr>
              </table>

              <div style="font-size:40px;margin-bottom:16px;">🚀</div>

              <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;line-height:1.3;">
                Geleceğin Evine<br/>Adım Attınız
              </h1>
              <p style="margin:10px 0 0;font-size:13px;font-weight:600;color:rgba(255,255,255,0.75);letter-spacing:2px;text-transform:uppercase;">
                Erken Erişiminiz Onaylandı
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 48px 0;">
              <p style="margin:0;font-size:16px;color:#374151;line-height:1.8;">
                Merhaba <strong style="color:#7c3aed;">${name}</strong>,
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:16px 48px 28px;">
              <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.9;">
                Akıllı ev teknolojilerinin sadece telefon ekranından basılan "aç/kapat"
                butonlarından ibaret olmadığına, evinizin sizinle gerçek bir uyum içinde
                yaşaması gerektiğine inanıyoruz. Bu vizyonla tamamen otonom ve yerel ağda
                çalışan bir mimariyle geliştirdiğimiz <strong style="color:#7c3aed;">Alex</strong>'e
                hoş geldiniz.
              </p>
              <p style="margin:16px 0 0;font-size:15px;color:#4b5563;line-height:1.9;">
                Sistemin ilk inananlarından biri olarak erken erişim listesindeki yerinizi
                başarıyla ayırdık. Bu, vizyonumuzu gerçeğe dönüştürdüğümüz bu yolda en
                değerli destekçilerimizden biri olduğunuz anlamına geliyor.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:#e5e7eb;"></div>
            </td>
          </tr>

          <!-- Privileges heading -->
          <tr>
            <td align="center" style="padding:28px 48px 20px;">
              <p style="margin:0;font-size:12px;font-weight:700;color:#7c3aed;letter-spacing:2px;text-transform:uppercase;">
                Hesabınıza Tanımlanan Ayrıcalıklar
              </p>
            </td>
          </tr>

          <!-- Privilege 1 -->
          <tr>
            <td style="padding:0 40px 12px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="48" valign="top">
                          <div style="width:38px;height:38px;background:#ede9fe;border-radius:10px;text-align:center;line-height:38px;font-size:18px;">🗓️</div>
                        </td>
                        <td style="padding-left:4px;">
                          <p style="margin:0 0 5px;font-size:15px;font-weight:700;color:#5b21b6;">21 Günlük Ücretsiz Erişim</p>
                          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;">
                            Alex'in evinizin dinamiklerini nasıl otonom bir şekilde yönettiğini
                            tam 3 hafta boyunca hiçbir kısıtlama olmadan, tamamen ücretsiz
                            deneyimleyeceksiniz.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Privilege 2 -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="48" valign="top">
                          <div style="width:38px;height:38px;background:#ede9fe;border-radius:10px;text-align:center;line-height:38px;font-size:18px;">🏷️</div>
                        </td>
                        <td style="padding-left:4px;">
                          <p style="margin:0 0 5px;font-size:15px;font-weight:700;color:#5b21b6;">Erken Kayıt Özel Fiyatlandırması</p>
                          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;">
                            Ücretsiz erişim sürenizin sonunda yolculuğunuza Alex ile devam etmek
                            isterseniz, sadece erken kayıt listemizdeki kullanıcılara özel olarak
                            tanımlanan ve standart paketlerin çok daha altında olan indirimli
                            <strong style="color:#7c3aed;">"İlk Kullanıcı"</strong> fiyatlandırmasından yararlanacaksınız.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:#e5e7eb;"></div>
            </td>
          </tr>

          <!-- What's next -->
          <tr>
            <td style="padding:28px 48px;">
              <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.9;">
                Şu anda Alex'in altyapısını binlerce cihazı aynı anda, sıfır gecikmeyle
                yönetecek otonom kapasiteye ulaştırmak için arka planda yoğun bir şekilde
                çalışıyoruz.
              </p>
              <p style="margin:16px 0 0;font-size:15px;color:#4b5563;line-height:1.9;">
                Sistem sizin evinizde hayata geçmeye hazır olduğunda, kurulum adımları
                ve özel erişim bağlantınız ile size tekrar ulaşacağız. O zamana kadar
                heyecanımızı paylaştığınız için teşekkür ederiz.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:4px 48px 36px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="border-radius:50px;background:#7c3aed;">
                    <a href="${APP_URL}"
                      target="_blank"
                      style="display:inline-block;padding:14px 36px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.5px;border-radius:50px;">
                      Aramıza Hoş Geldiniz! 🏠
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:#e5e7eb;"></div>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:28px 48px 36px;">
              <p style="margin:0;font-size:13px;color:#9ca3af;">Saygılarımızla,</p>
              <p style="margin:4px 0 2px;font-size:16px;font-weight:700;color:#7c3aed;">Alex</p>
              <p style="margin:0;font-size:13px;color:#9ca3af;">Akıllı Ev Asistanınız</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;">
              <p style="margin:0 0 6px;font-size:11px;color:#9ca3af;line-height:1.7;text-align:center;">
                Bu e-posta, <a href="${APP_URL}/erken-kayit" style="color:#7c3aed;text-decoration:none;">${APP_URL}/erken-kayit</a>
                adresinden erken kayıt listemize kaydolduğunuz için otomatik olarak gönderilmiştir.<br/>
                Eğer bu kaydı siz yapmadıysanız bu e-postayı güvenle yok sayabilirsiniz.
              </p>
              <p style="margin:8px 0 0;font-size:10px;color:#d1d5db;text-align:center;letter-spacing:0.5px;">
                Powered by <strong style="color:#a78bfa;">Petratech Inc.</strong>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

  return { subject, html };
}
