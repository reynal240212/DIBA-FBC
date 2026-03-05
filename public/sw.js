
self.addEventListener('push', function (event) {
    let data = { title: 'DIBA FBC', body: 'Nuevo mensaje en el club' };
    if (event.data) {
        data = event.data.json();
    }

    const options = {
        body: data.body,
        icon: '/images/ESCUDO.png',
        badge: '/images/ESCUDO.png',
        vibrate: [100, 50, 100],
        data: {
            url: '/chat.html'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
