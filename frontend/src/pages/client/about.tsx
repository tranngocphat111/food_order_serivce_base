
const AboutPage = () => {
    return (
        <div className="page-surface" style={{ padding: '24px 0' }}>
            <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 16px' }}>
                <div className="admin-hero">
                    <div className="admin-hero__inner" style={{ gridTemplateColumns: '1fr' }}>
                        <div className="admin-hero__copy">
                            <h2>Về FoodFlow</h2>
                            <p>
                                Một nền tảng đặt món và quản trị đơn hàng được thiết kế đồng bộ, tập trung vào tốc độ thao tác và trải nghiệm rõ ràng.
                            </p>
                            <div className="admin-hero__chips">
                                <span className="admin-hero__chip">Đặt món nhanh</span>
                                <span className="admin-hero__chip">Admin hiện đại</span>
                                <span className="admin-hero__chip">Tối ưu cho mobile</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AboutPage;