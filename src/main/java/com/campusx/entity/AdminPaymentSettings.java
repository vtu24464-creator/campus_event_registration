package com.campusx.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * AdminPaymentSettings — maps to the `admin_payment_settings` table.
 * Single-row table (id = 1) for admin's payment receiving details.
 */
@Entity
@Table(name = "admin_payment_settings")
public class AdminPaymentSettings {

    @Id
    private Integer id = 1;

    @Column(name = "upi_id", length = 100)
    private String upiId = "nale.dushyanth@okaxis";

    @Column(name = "upi_phone", length = 20)
    private String upiPhone = "9876543210";

    @Column(name = "bank_name", length = 100)
    private String bankName = "State Bank of India";

    @Column(name = "bank_account", length = 30)
    private String bankAccount = "12345678901";

    @Column(name = "ifsc_code", length = 15)
    private String ifscCode = "SBIN0001234";

    @Column(name = "account_name", length = 100)
    private String accountName = "NALE DUSHYANTH";

    @Column(name = "qr_code_path", length = 500)
    private String qrCodePath = "/banners/payment_qr.png";

    @Column(name = "pay_note", length = 1000)
    private String payNote;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public String getUpiPhone() {
        return upiPhone;
    }

    public void setUpiPhone(String upiPhone) {
        this.upiPhone = upiPhone;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getBankAccount() {
        return bankAccount;
    }

    public void setBankAccount(String bankAccount) {
        this.bankAccount = bankAccount;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
    }

    public String getQrCodePath() {
        return qrCodePath;
    }

    public void setQrCodePath(String qrCodePath) {
        this.qrCodePath = qrCodePath;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getPayNote() {
        return payNote;
    }

    public void setPayNote(String payNote) {
        this.payNote = payNote;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
